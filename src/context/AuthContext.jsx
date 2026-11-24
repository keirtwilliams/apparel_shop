import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create profile row in public.profiles
  const fetchProfile = async (userId, userEmail) => {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet: create default customer profile
        const newProfile = {
          id: userId,
          email: userEmail,
          full_name: userEmail.split('@')[0],
          role: 'customer',
          created_at: new Date().toISOString()
        };
        const { data: inserted } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        return inserted || newProfile;
      }

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured || !supabase) {
      // Local fallback mode when Supabase credentials are not yet set
      const savedMock = localStorage.getItem('purgatory_current_user');
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          setUser({ id: parsed.id, email: parsed.email });
          setProfile(parsed);
        } catch (e) { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id, session.user.email);
        if (mounted) setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    });

    // 2. Real-Time Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id, session.user.email);
        if (mounted) setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign Up with Email and Password
  const signUp = async ({ email, password, fullName = '' }) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  // Sign In with Email and Password
  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('SignOut error:', err);
      }
    }
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
