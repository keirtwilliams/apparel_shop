import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import initialData from '../data/initialData.json';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DEFAULT_PROMO_CODES,
  calculateEffectiveProductPrice,
  validateCoupon
} from '../lib/pricing';

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

// Default Seed Customer Account (using synthetic fake Gmail and demographic specs)
export const DEFAULT_CUSTOMER = {
  id: 'cust-demo-001',
  email: 'marcus.thorne@gmail.com', // Synthetic test Gmail
  password: 'password123',
  first_name: 'Marcus',
  middle_initial: 'V',
  last_name: 'Thorne',
  full_name: 'Marcus V. Thorne',
  dob: '1998-05-14',
  age: 28,
  phone: '+63 917 555 0192',
  address: 'Unit 18B, One Serendra, 32nd St',
  city: 'BGC, Taguig City',
  postal_code: '1634',
  country: 'Philippines',
  role: 'customer',
  created_at: '2026-01-15T08:00:00Z'
};

export const StoreProvider = ({ children }) => {
  // Products and inventory
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('purgatory_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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

  // Cart state synced with localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('purgatory_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);

  // Registered Customer Accounts Database (localStorage for now, Supabase tomorrow)
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('purgatory_customer_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [DEFAULT_CUSTOMER];
  });

  // Active Logged-in Customer Profile (null if browsing as Guest)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('purgatory_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_CUSTOMER;
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

  // Applied Coupon Code State
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('purgatory_applied_coupon');
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
    if (appliedCoupon) {
      localStorage.setItem('purgatory_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('purgatory_applied_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('purgatory_coupons', JSON.stringify(coupons));
  }, [coupons]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('purgatory_cart', JSON.stringify(cart));
  }, [cart]);

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

  // If Supabase is connected, fetch from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function loadSupabaseData() {
      try {
        const { data: prods, error: pErr } = await supabase
          .from('products')
          .select('*, variants:product_variants(*)');
        if (!pErr && prods && prods.length > 0) {
          setProducts(prods);
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
  }, []);

  // --- CUSTOMER AUTHENTICATION METHODS (Fake Gmail + Demographic Profiles) ---
  const signIn = ({ email, password }) => {
    const found = accounts.find(
      acc => acc.email.toLowerCase() === email.trim().toLowerCase()
    );

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

  const signUp = ({
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
    const existing = accounts.find(acc => acc.email.toLowerCase() === cleanEmail);

    if (existing) {
      return { success: false, error: 'An account with this email is already registered.' };
    }

    const computedAge = age ? parseInt(age, 10) : (dob ? calculateAge(dob) : null);
    const fullName = formatFullName(first_name, middle_initial, last_name);

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

    setAccounts(prev => [...prev, newAccount]);
    const { password: _, ...safeUser } = newAccount;
    setCurrentUser(safeUser);
    return { success: true, user: safeUser };
  };

  const signOut = () => {
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

  // Coupon Actions
  const applyCouponCode = (code) => {
    const validated = validateCoupon(code, coupons);
    if (!validated) {
      return { success: false, message: 'Invalid or expired promotional code.' };
    }
    setAppliedCoupon(validated);
    return { success: true, message: `Applied ${validated.code} (${validated.discountPercent}% OFF)` };
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

  // Coupon Discount Amount in Currency
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon || !appliedCoupon.discountPercent) return 0;
    const discount = (cartSubtotal * appliedCoupon.discountPercent) / 100;
    return Math.round(discount * 100) / 100;
  }, [cartSubtotal, appliedCoupon]);

  // Final Order Total after Coupon
  const cartFinalTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - couponDiscountAmount);
  }, [cartSubtotal, couponDiscountAmount]);

  // --- CHECKOUT & ORDER CREATION ---
  const placeOrder = async ({ customerName, customerEmail, shippingAddress, paymentMethod }) => {
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
          total_amount: cartSubtotal,
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
    setAccounts([DEFAULT_CUSTOMER]);
    setCurrentUser(DEFAULT_CUSTOMER);
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
        lowStockVariants,
        resetToSeedData
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
