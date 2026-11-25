import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import initialData from '../data/initialData.json';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { appCache, imageCache } from '../lib/cache';
import { rateLimiter } from '../lib/rateLimiter';
import {
  DEFAULT_PROMO_CODES,
  calculateEffectiveProductPrice,
  validateCoupon
} from '../lib/pricing';
import { sendConfirmationEmail, generateVerificationCode } from '../lib/emailService';

const StoreContext = createContext(null);

// Helper to calculate exact age from Date of Birth (DOB)
export const calculateAge = (dobString) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return '';
  const today = new Date('2026-11-23');
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
};

// Helper to validate password complexity
export const isPasswordComplex = (password = '') => {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false;
  return true;
};

// Helper to format full name with Middle Initial
export const formatFullName = (first = '', mi = '', last = '') => {
  const parts = [];
  if (first?.trim()) parts.push(first.trim());
  if (mi?.trim()) {
    const cleanMi = mi.trim().toUpperCase().replace(/\./g, '');
    parts.push(`${cleanMi}.`);
  }
  if (last?.trim()) parts.push(last.trim());
  return parts.join(' ');
};

export const StoreProvider = ({ children }) => {
  // Products and inventory with automatic version sync for real product images
  const [products, setProducts] = useState(() => {
    const CURRENT_VERSION = 'v5_only_6_garments';
    const version = localStorage.getItem('purgatory_products_version');
    if (version !== CURRENT_VERSION) {
      localStorage.setItem('purgatory_products_version', CURRENT_VERSION);
      localStorage.setItem('purgatory_products', JSON.stringify(initialData.products));
      return initialData.products || [];
    }
    const saved = localStorage.getItem('purgatory_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep saved variant inventory while syncing master product images from initialData
          return parsed.map(p => {
            const master = (initialData.products || []).find(m => m.id === p.id || m.slug === p.slug);
            if (master && master.images && master.images.length > 0) {
              return { ...p, images: master.images };
            }
            return p;
          });
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return initialData.products || [];
  });

  // Orders history
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('purgatory_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialData.orders || [];
  });

  // Per-account storage key helpers
  const getCartStorageKey = (userObj) => (userObj?.id ? `purgatory_cart_${userObj.id}` : 'purgatory_cart_guest');
  const getCouponStorageKey = (userObj) => (userObj?.id ? `purgatory_coupon_${userObj.id}` : 'purgatory_coupon_guest');

  // Active Logged-in Customer Profile (null = guest browsing)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('purgatory_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Purge legacy demo customer
        if (parsed?.id === 'cust-demo-001' || parsed?.email?.includes('marcus.thorne') || parsed?.first_name === 'Marcus') {
          localStorage.removeItem('purgatory_current_user');
          return null;
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Cart state synced per-account with localStorage
  const [cart, setCart] = useState(() => {
    // Purge legacy shared cart key so deleted/other-account items never leak
    localStorage.removeItem('purgatory_cart');
    const savedUser = localStorage.getItem('purgatory_current_user');
    let parsedUser = null;
    try { parsedUser = savedUser ? JSON.parse(savedUser) : null; } catch (e) { /* ignore */ }
    const saved = localStorage.getItem(getCartStorageKey(parsedUser));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Background Image Cache Warming for instant, zero-latency hover flips & transitions
  useEffect(() => {
    const urls = [];
    products.forEach(p => {
      if (Array.isArray(p.images)) {
        p.images.forEach(img => img && urls.push(img));
      }
    });
    imageCache.preloadMany(urls);
  }, [products]);

  // Registered Customer Accounts Database
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('purgatory_customer_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => a.id !== 'cust-demo-001' && !a.email?.includes('marcus.thorne'));
        }
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Active user / RBAC Role ('customer' | 'admin')
  const [role, setRole] = useState(() => {
    return localStorage.getItem('purgatory_role') || 'customer';
  });

  // Storewide / Category Flash Sale Configuration (10% to 90% off)
  const [saleConfig, setSaleConfig] = useState(() => {
    const saved = localStorage.getItem('purgatory_sale_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      active: false,
      percentage: 20, // default 20%
      categoryTarget: 'All', // 'All' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear'
      bannerText: 'ARCHIVE SALE — UP TO 90% OFF SELECT PIECES'
    };
  });

  // Applied Coupon Code State (per-account)
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    localStorage.removeItem('purgatory_applied_coupon');
    const saved = localStorage.getItem(getCouponStorageKey(currentUser));
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Available Promotional Coupons Registry (can be customized via Admin)
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('purgatory_coupons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_PROMO_CODES;
  });

  // Sync Sale & Promo state to localStorage
  useEffect(() => {
    localStorage.setItem('purgatory_sale_config', JSON.stringify(saleConfig));
  }, [saleConfig]);

  useEffect(() => {
    const key = getCouponStorageKey(currentUser);
    if (appliedCoupon) {
      localStorage.setItem(key, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(key);
    }
  }, [appliedCoupon, currentUser]);

  useEffect(() => {
    localStorage.setItem('purgatory_coupons', JSON.stringify(coupons));
  }, [coupons]);

  // Reload cart & coupon whenever active account changes (login / logout / switch)
  useEffect(() => {
    const savedCart = localStorage.getItem(getCartStorageKey(currentUser));
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    } else {
      setCart([]);
    }

    const savedCoupon = localStorage.getItem(getCouponStorageKey(currentUser));
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        setAppliedCoupon(null);
      }
    } else {
      setAppliedCoupon(null);
    }
  }, [currentUser?.id]);

  // Sync active account's cart to localStorage
  useEffect(() => {
    localStorage.setItem(getCartStorageKey(currentUser), JSON.stringify(cart));
  }, [cart, currentUser]);

  useEffect(() => {
    localStorage.setItem('purgatory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('purgatory_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('purgatory_customer_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('purgatory_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('purgatory_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('purgatory_role', role);
  }, [role]);

  // Cross-tab localStorage sync (keeps Admin tab & Storefront Catalogue tab in instant sync)
  useEffect(() => {
    const handleStorageSync = (e) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'purgatory_products') {
          appCache.invalidateTag('products');
          setProducts(JSON.parse(e.newValue));
        } else if (e.key === 'purgatory_sale_config') {
          appCache.invalidateTag('pricing');
          setSaleConfig(JSON.parse(e.newValue));
        } else if (e.key === 'purgatory_coupons') {
          setCoupons(JSON.parse(e.newValue));
        } else if (e.key === 'purgatory_orders') {
          setOrders(JSON.parse(e.newValue));
        }
      } catch (err) { /* ignore parse errors */ }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  // If Supabase is connected, fetch from Supabase and subscribe to live changes in real time
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function loadSupabaseData() {
      try {
        const { data: prods, error: pErr } = await supabase
          .from('products')
          .select('*, variants:product_variants(*)')
          .order('created_at', { ascending: true });
        if (!pErr && prods && prods.length > 0) {
          // Preserve active local sale/markdown overrides (on_sale, discount_percent, sale_ends_at)
          let localProducts = [];
          try {
            localProducts = JSON.parse(localStorage.getItem('purgatory_products') || '[]');
          } catch (e) { /* ignore */ }
          const localMap = new Map(localProducts.map(lp => [lp.id, lp]));

          const merged = prods.map(sp => {
            const lp = localMap.get(sp.id);
            if (lp && (lp.on_sale || lp.sale_ends_at || (lp.compare_at_price && lp.compare_at_price > lp.price))) {
              return {
                ...sp,
                price: lp.price,
                compare_at_price: lp.compare_at_price,
                original_base_price: lp.original_base_price || sp.price,
                on_sale: lp.on_sale,
                discount_percent: lp.discount_percent,
                sale_ends_at: lp.sale_ends_at || null
              };
            }
            return sp;
          });
          setProducts(merged);
        }

        const { data: ords, error: oErr } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', { ascending: false });
        if (!oErr && ords && ords.length > 0) {
          setOrders(ords);
        }
      } catch (err) {
        console.warn('Could not sync with Supabase, using local state:', err);
      }
    }

    loadSupabaseData();

    // REAL-TIME POSTGRES SUBSCRIPTION (Listens to live garment drops, variant updates, and orders)
    const channel = supabase
      .channel('realtime_storefront_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          // Whenever an admin adds, edits, or deletes a shirt, reload fresh products immediately
          loadSupabaseData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        () => {
          // Whenever an admin adjusts stock or sizes, refresh live
          loadSupabaseData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Whenever an order status changes or a customer places an order
          loadSupabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- CUSTOMER AUTHENTICATION METHODS (Supabase Auth + Resend SMTP Confirmation) ---
  const signIn = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is connected, authenticate against Supabase auth.users
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          // If email is not confirmed yet
          if (error.message.includes('Email not confirmed')) {
            return {
              success: false,
              error: 'Please verify your email address. Check your inbox for the confirmation link sent via Resend.'
            };
          }
          return { success: false, error: error.message };
        }

        if (data?.user) {
          // Verify user profile still exists in public.profiles
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!profileError && !profile) {
            await supabase.auth.signOut();
            localStorage.removeItem(`purgatory_cart_${data.user.id}`);
            localStorage.removeItem(`purgatory_coupon_${data.user.id}`);
            setAccounts(prev => prev.filter(acc => acc.id !== data.user.id && acc.email?.toLowerCase() !== cleanEmail));
            setCurrentUser(null);
            return {
              success: false,
              error: 'This account no longer exists or has been deleted.'
            };
          }

          const activeUser = profile || {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: 'customer'
          };

          setCurrentUser(activeUser);
          if (activeUser.role) setRole(activeUser.role);
          return { success: true, user: activeUser };
        }
      } catch (err) {
        return { success: false, error: err.message || 'Authentication failed.' };
      }
    }

    // Fallback: Local account database
    const found = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'No client profile registered with this email.' };
    }
    if (found.password && found.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    const { password: _, ...safeUser } = found;
    setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  };

  const signUp = async ({
    first_name,
    middle_initial = '',
    last_name,
    dob = '',
    age = '',
    email,
    password,
    phone = '',
    address = '',
    city = '',
    postal_code = '',
    country = 'Philippines'
  }) => {
    const cleanEmail = email.trim().toLowerCase();
    const fullName = formatFullName(first_name, middle_initial, last_name);
    const computedAge = age ? parseInt(age, 10) : (dob ? calculateAge(dob) : null);

    // Password complexity validation (8+ chars, upper, lower, number, special char)
    if (!isPasswordComplex(password)) {
      return {
        success: false,
        error: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (!@#$%^&*).'
      };
    }

    // 1. If Supabase is configured, use Supabase Auth with your newly configured SMTP!
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              first_name: first_name.trim(),
              middle_initial: middle_initial.trim().toUpperCase(),
              last_name: last_name.trim(),
              full_name: fullName,
              dob: dob.trim(),
              age: computedAge,
              phone: phone.trim(),
              address: address.trim(),
              city: city.trim(),
              postal_code: postal_code.trim(),
              country
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // Supabase returns an empty identities array (and sends no email) if the email already exists in auth.users
        if (data?.user?.identities && data.user.identities.length === 0) {
          return {
            success: false,
            error: 'This email is already registered in Supabase Auth. Please sign in or delete it from Authentication → Users first.'
          };
        }

        // Check if confirmation code / email was dispatched
        const requiresConfirmation = !data.session;

        const newAccount = {
          id: data.user?.id || `cust-${Date.now()}`,
          email: cleanEmail,
          password,
          first_name: first_name.trim(),
          middle_initial: middle_initial.trim().toUpperCase(),
          last_name: last_name.trim(),
          full_name: fullName,
          dob: dob.trim(),
          age: computedAge,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postal_code: postal_code.trim(),
          country,
          role: 'customer',
          created_at: new Date().toISOString()
        };

        if (requiresConfirmation) {
          return {
            success: true,
            verificationRequired: true,
            isSupabaseAuth: true,
            pendingAccount: newAccount,
            emailSent: true
          };
        } else {
          // Direct login if session returned
          setAccounts(prev => [...prev, newAccount]);
          const { password: _, ...safeUser } = newAccount;
          setCurrentUser(safeUser);
          return { success: true, user: safeUser };
        }
      } catch (err) {
        console.error('[Supabase Signup Error]', err);
        return { success: false, error: err.message || 'Registration failed.' };
      }
    }

    // Fallback: Local accounts with authentic Resend email verification
    const existing = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email is already registered.' };
    }

    const newAccount = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      password,
      first_name: first_name.trim(),
      middle_initial: middle_initial.trim().toUpperCase(),
      last_name: last_name.trim(),
      full_name: fullName,
      dob: dob.trim(),
      age: computedAge,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postal_code: postal_code.trim(),
      country,
      role: 'customer',
      created_at: new Date().toISOString()
    };

    // Dispatch authentic Resend confirmation email with 6-digit code
    const verificationCode = generateVerificationCode();
    let emailSent = false;
    let emailError = null;
    let relayedToOwner = false;
    let ownerEmail = null;

    try {
      const emailRes = await sendConfirmationEmail({
        to: cleanEmail,
        code: verificationCode,
        fullName
      });
      emailSent = emailRes.success;
      relayedToOwner = Boolean(emailRes.relayedToOwner);
      ownerEmail = emailRes.ownerEmail;
      if (!emailRes.success) {
        emailError = emailRes.error;
      }
    } catch (e) {
      console.error('[Verification Dispatch Failed]', e);
      emailError = e.message;
    }

    // Return pending verification state for OTP verification step
    return {
      success: true,
      verificationRequired: true,
      verificationCode,
      pendingAccount: newAccount,
      emailSent,
      emailError,
      relayedToOwner,
      ownerEmail
    };
  };

  // Confirm pending account with OTP code or Supabase verifyOtp
  const confirmRegistration = async (pendingAccount, enteredCode, expectedCode, isSupabaseAuth = false) => {
    if (!pendingAccount) {
      return { success: false, error: 'No pending registration found.' };
    }

    // If using Supabase Auth with custom SMTP
    if (isSupabaseAuth && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: pendingAccount.email,
          token: enteredCode.trim(),
          type: 'signup'
        });

        if (error) {
          // If token format not 6-digit OTP or link was clicked
          return { success: false, error: error.message };
        }

        setAccounts(prev => [...prev, pendingAccount]);
        const { password: _, ...safeUser } = pendingAccount;
        setCurrentUser(safeUser);
        return { success: true, user: safeUser };
      } catch (e) {
        return { success: false, error: e.message || 'Verification failed.' };
      }
    }

    // Local / Resend code verification
    if (expectedCode && enteredCode.trim() !== expectedCode.trim()) {
      return { success: false, error: 'Invalid verification code. Please check your email and try again.' };
    }

    setAccounts(prev => [...prev, pendingAccount]);
    const { password: _, ...safeUser } = pendingAccount;
    setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  };

  // Resend a new verification code to the recipient
  const resendVerificationCode = async (email, fullName, isSupabaseAuth = false) => {
    if (isSupabaseAuth && isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email
        });
        if (error) throw error;
        return { success: true, isSupabaseAuth: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    const newCode = generateVerificationCode();
    try {
      const res = await sendConfirmationEmail({
        to: email,
        code: newCode,
        fullName
      });
      return { success: res.success, newCode, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) { /* ignore */ }
    }
    setCurrentUser(null);
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;

    // Recalculate full_name if first_name, middle_initial, or last_name changed
    const firstName = updates.first_name !== undefined ? updates.first_name : currentUser.first_name;
    const mi = updates.middle_initial !== undefined ? updates.middle_initial : currentUser.middle_initial;
    const lastName = updates.last_name !== undefined ? updates.last_name : currentUser.last_name;
    const fullName = formatFullName(firstName, mi, lastName);

    // Recalculate age if dob changed
    const dob = updates.dob !== undefined ? updates.dob : currentUser.dob;
    const computedAge = dob ? calculateAge(dob) : (updates.age || currentUser.age);

    const updatedUser = {
      ...currentUser,
      ...updates,
      full_name: fullName,
      age: computedAge
    };

    setCurrentUser(updatedUser);

    setAccounts(prev =>
      prev.map(acc => (acc.id === currentUser.id ? { ...acc, ...updatedUser } : acc))
    );
  };

  // Scoped Orders: returns orders strictly belonging to the active customer
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(
      o =>
        (o.customer_email && o.customer_email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (o.user_id && o.user_id === currentUser.id)
    );
  }, [orders, currentUser]);

  // Guest order lookup helper
  const lookupOrder = (orderId, email) => {
    return orders.find(
      o =>
        o.id.toUpperCase() === orderId.trim().toUpperCase() &&
        o.customer_email.toLowerCase() === email.trim().toLowerCase()
    );
  };

  // --- CART ACTIONS ---
  const addToCart = (product, variant, quantity = 1) => {
    // Determine effective selling price considering product markdowns or storewide sale
    const { currentPrice, originalPrice, isOnSale } = calculateEffectiveProductPrice(product, saleConfig);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.productId === product.id && item.variantId === variant.id
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        const maxStock = variant.stock_count;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            category: product.category,
            image: product.images?.[0] || '',
            variantId: variant.id,
            colorName: variant.color_name,
            colorHex: variant.color_hex,
            size: variant.size,
            unitPrice: currentPrice,
            originalUnitPrice: originalPrice,
            isOnSale,
            stockCount: variant.stock_count,
            quantity: Math.min(quantity, variant.stock_count)
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartItemQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === cartItemId) {
          const clampedQty = Math.min(quantity, item.stockCount);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const updateCartItemSize = (cartItemId, newSize) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(i => i.id === cartItemId);
      if (!itemToUpdate) return prevCart;

      const product = products.find(p => p.id === itemToUpdate.productId);
      if (!product) return prevCart;

      const newVariant = product.variants.find(
        v => v.size === newSize && v.color_name === itemToUpdate.colorName
      ) || product.variants.find(v => v.size === newSize);

      if (!newVariant || newVariant.stock_count === 0) {
        return prevCart;
      }

      return prevCart.map(item => {
        if (item.id === cartItemId) {
          return {
            ...item,
            variantId: newVariant.id,
            size: newVariant.size,
            stockCount: newVariant.stock_count,
            quantity: Math.min(item.quantity, newVariant.stock_count)
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupon Actions (strictly 1 discount per item — sale items are excluded)
  const applyCouponCode = (code) => {
    const validated = validateCoupon(code, coupons);
    if (!validated) {
      return { success: false, message: 'Invalid or expired promotional code.' };
    }
    if (cart.length > 0 && cart.every(item => item.isOnSale)) {
      return {
        success: false,
        message: 'Items already on sale cannot use a coupon (1 discount per item max).'
      };
    }
    setAppliedCoupon(validated);
    return { success: true, message: `Applied ${validated.code} (${validated.discountPercent}% OFF regular items)` };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  const cartTotalCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Raw Subtotal from Cart Items
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }, [cart]);

  // Coupon Discount Amount in Currency (strictly 1 discount per item — only regular-priced items)
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.discountPercent) return 0;
    const eligibleSubtotal = cart.reduce(
      (total, item) => (item.isOnSale ? total : total + item.unitPrice * item.quantity),
      0
    );
    const discount = (eligibleSubtotal * appliedCoupon.discountPercent) / 100;
    return Math.round(discount * 100) / 100;
  }, [cart, appliedCoupon]);

  // Final Order Total after Coupon
  const cartFinalTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - couponDiscountAmount);
  }, [cartSubtotal, couponDiscountAmount]);

  // --- CHECKOUT & ORDER CREATION ---
  const placeOrder = async ({ customerName, customerEmail, shippingAddress, paymentMethod }) => {
    // Sliding-window rate limit & double-click debounce protection
    const limitCheck = rateLimiter.check('checkout_order');
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.message);
    }
    rateLimiter.record('checkout_order');

    const newOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString();

    const orderItems = cart.map((item, idx) => ({
      id: `oi-${newOrderId}-${idx}`,
      order_id: newOrderId,
      variant_id: item.variantId,
      product_id: item.productId,
      product_name: item.productName,
      category: item.category,
      color_name: item.colorName,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      created_at: createdAt
    }));

    const newOrder = {
      id: newOrderId,
      user_id: currentUser ? currentUser.id : null,
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: 'paid',
      status: 'pending',
      total_amount: cartFinalTotal,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: couponDiscountAmount,
      created_at: createdAt,
      items: orderItems
    };

    // 1. Decrement stock in state
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const updatedVariants = prod.variants.map(v => {
          const cartItem = cart.find(ci => ci.variantId === v.id);
          if (cartItem) {
            return {
              ...v,
              stock_count: Math.max(0, v.stock_count - cartItem.quantity)
            };
          }
          return v;
        });
        return { ...prod, variants: updatedVariants };
      });
    });

    // 2. Add to orders in state
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // 3. If Supabase configured, execute on backend
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert({
          id: newOrderId,
          user_id: currentUser ? currentUser.id : null,
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          payment_status: 'paid',
          status: 'pending',
          total_amount: cartFinalTotal,
          created_at: createdAt
        });

        const itemsToInsert = orderItems.map(oi => ({
          id: oi.id,
          order_id: oi.order_id,
          variant_id: oi.variant_id,
          quantity: oi.quantity,
          unit_price: oi.unit_price
        }));
        await supabase.from('order_items').insert(itemsToInsert);
      } catch (err) {
        console.error('Supabase order creation error:', err);
      }
    }

    // 4. Clear shopping cart
    clearCart();

    return newOrder;
  };

  // --- ADMIN ORDER MANAGEMENT ---
  const refundOrder = async (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder || targetOrder.payment_status === 'refunded') return;

    // Restore stock
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const updatedVariants = prod.variants.map(v => {
          const itemInOrder = targetOrder.items?.find(it => it.variant_id === v.id);
          if (itemInOrder) {
            return {
              ...v,
              stock_count: v.stock_count + itemInOrder.quantity
            };
          }
          return v;
        });
        return { ...prod, variants: updatedVariants };
      });
    });

    // Mark as refunded
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === orderId
          ? { ...o, payment_status: 'refunded', status: 'refunded' }
          : o
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ payment_status: 'refunded', status: 'refunded' })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase refund error:', err);
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase status update error:', err);
      }
    }
  };

  const addNewProduct = async (productData) => {
    setProducts(prev => [productData, ...prev]);
    if (isSupabaseConfigured && supabase) {
      try {
        const { variants, ...prodOnly } = productData;
        await supabase.from('products').insert(prodOnly);
        if (variants && variants.length > 0) {
          await supabase.from('product_variants').insert(variants);
        }
      } catch (err) {
        console.error('Supabase add product error:', err);
      }
    }
  };

  // Low stock variants list (stock_count <= 5)
  const lowStockVariants = useMemo(() => {
    const list = [];
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.stock_count <= 5) {
          list.push({
            productId: p.id,
            productName: p.name,
            category: p.category,
            variantId: v.id,
            colorName: v.color_name,
            colorHex: v.color_hex,
            size: v.size,
            stockCount: v.stock_count,
            isOutOfStock: v.stock_count === 0
          });
        }
      });
    });
    return list;
  }, [products]);

  // Admin Per-Garment Variant Stock Adjustment (Syncs to LocalState + Supabase Database)
  const updateVariantStock = async (productId, variantId, newStock) => {
    appCache.invalidateTag('products');
    const safeStock = Math.max(0, parseInt(newStock, 10) || 0);

    setProducts(prevProducts => {
      const updated = prevProducts.map(prod => {
        if (prod.id === productId) {
          return {
            ...prod,
            variants: prod.variants.map(v => {
              if (v.id === variantId) {
                return { ...v, stock_count: safeStock };
              }
              return v;
            })
          };
        }
        return prod;
      });
      localStorage.setItem('purgatory_products', JSON.stringify(updated));
      return updated;
    });

    // Sync directly to Supabase product_variants table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('product_variants')
          .update({ stock_count: safeStock })
          .eq('id', variantId);
      } catch (err) {
        console.error('Failed to sync variant stock to Supabase:', err);
      }
    }
  };

  // Admin Per-Garment Sale & Markdown Controller
  const updateProductSale = (productId, { isOnSale, discountPercent, durationMinutes }) => {
    appCache.invalidateTag('products');
    appCache.invalidateTag('pricing');
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        if (p.id === productId) {
          const original = p.original_base_price || p.compare_at_price || p.price;
          if (!isOnSale) {
            return {
              ...p,
              price: original,
              compare_at_price: null,
              original_base_price: original,
              on_sale: false,
              discount_percent: 0,
              sale_ends_at: null
            };
          }
          const pct = Math.min(Math.max(Number(discountPercent) || 20, 5), 90);
          const salePrice = Math.round(original * (1 - pct / 100));
          let nextSaleEndsAt = p.sale_ends_at && p.sale_ends_at > Date.now() ? p.sale_ends_at : null;
          if (durationMinutes === null) {
            nextSaleEndsAt = null;
          } else if (typeof durationMinutes === 'number' && durationMinutes > 0) {
            nextSaleEndsAt = Date.now() + durationMinutes * 60 * 1000;
          }
          return {
            ...p,
            price: salePrice,
            compare_at_price: original,
            original_base_price: original,
            on_sale: true,
            discount_percent: pct,
            sale_ends_at: nextSaleEndsAt
          };
        }
        return p;
      });
      localStorage.setItem('purgatory_products', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset to factory seed data
  const resetToSeedData = () => {
    localStorage.removeItem('purgatory_products');
    localStorage.removeItem('purgatory_orders');
    localStorage.removeItem('purgatory_cart');
    localStorage.removeItem('purgatory_customer_accounts');
    localStorage.removeItem('purgatory_current_user');
    setProducts(initialData.products);
    setOrders(initialData.orders);
    setCart([]);
    setAccounts([]);
    setCurrentUser(null);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        orders,
        userOrders,
        lookupOrder,
        cart,
        isCartOpen,
        setIsCartOpen,
        isAccountDrawerOpen,
        setIsAccountDrawerOpen,
        role,
        setRole,
        currentUser,
        signIn,
        signUp,
        confirmRegistration,
        resendVerificationCode,
        signOut,
        updateProfile,
        addToCart,
        updateCartItemQuantity,
        updateCartItemSize,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        cartFinalTotal,
        couponDiscountAmount,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        coupons,
        setCoupons,
        saleConfig,
        setSaleConfig,
        placeOrder,
        refundOrder,
        updateOrderStatus,
        addNewProduct,
        updateVariantStock,
        updateProductSale,
        lowStockVariants,
        resetToSeedData,
        appCache,
        imageCache,
        rateLimiter
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
