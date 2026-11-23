import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X, User, Lock, Envelope, MapPin, Phone,
  SignOut, Check, WarningCircle, Sparkle, ArrowRight,
  PencilSimple, Package, Calendar, IdentificationBadge
} from '@phosphor-icons/react';
import { useStore, DEFAULT_CUSTOMER, calculateAge } from '../context/StoreContext';

export default function AccountDrawer() {
  const {
    currentUser,
    isAccountDrawerOpen,
    setIsAccountDrawerOpen,
    signIn,
    signUp,
    signOut,
    updateProfile,
    userOrders
  } = useStore();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Sign In Form State (Fake Gmail + Password)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form State (First Name, M.I., Surname, DOB, Age, Fake Gmail, Password, Phone, Address)
  const [signUpData, setSignUpData] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    dob: '',
    age: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  // Edit Profile Form State
  const [editData, setEditData] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    dob: '',
    age: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  // Keep edit state synced with active currentUser
  useEffect(() => {
    if (currentUser) {
      setEditData({
        first_name: currentUser.first_name || '',
        middle_initial: currentUser.middle_initial || '',
        last_name: currentUser.last_name || '',
        dob: currentUser.dob || '',
        age: currentUser.age || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        postal_code: currentUser.postal_code || ''
      });
    }
  }, [currentUser]);

  if (!isAccountDrawerOpen) return null;

  const handleClose = () => {
    setIsAccountDrawerOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setIsEditingProfile(false);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signInEmail || !signInPassword) {
      setErrorMsg('Please enter both fake Gmail and password.');
      return;
    }

    const res = signIn({ email: signInEmail, password: signInPassword });
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed.');
    } else {
      setSuccessMsg('Signed in successfully.');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  const handleQuickDemoFill = () => {
    setSignInEmail(DEFAULT_CUSTOMER.email);
    setSignInPassword(DEFAULT_CUSTOMER.password);
    setErrorMsg('');
  };

  // When DOB changes during Sign Up, auto-calculate Age
  const handleSignUpDobChange = (e) => {
    const dobValue = e.target.value;
    const computedAge = calculateAge(dobValue);
    setSignUpData(prev => ({
      ...prev,
      dob: dobValue,
      age: computedAge !== '' ? computedAge.toString() : prev.age
    }));
  };

  // When DOB changes during Edit Profile, auto-calculate Age
  const handleEditDobChange = (e) => {
    const dobValue = e.target.value;
    const computedAge = calculateAge(dobValue);
    setEditData(prev => ({
      ...prev,
      dob: dobValue,
      age: computedAge !== '' ? computedAge.toString() : prev.age
    }));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signUpData.first_name.trim() || !signUpData.last_name.trim()) {
      setErrorMsg('First Name and Surname are required.');
      return;
    }

    if (!signUpData.email.trim() || !signUpData.password.trim()) {
      setErrorMsg('Email and Password are required.');
      return;
    }

    const res = signUp(signUpData);
    if (!res.success) {
      setErrorMsg(res.error || 'Could not register client account.');
    } else {
      setSuccessMsg('Account registered and profile created.');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!editData.first_name.trim() || !editData.last_name.trim()) {
      setErrorMsg('First Name and Surname cannot be empty.');
      return;
    }

    updateProfile(editData);
    setIsEditingProfile(false);
    setSuccessMsg('Profile details updated.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1C1C1B]/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-lg bg-canvas border-l border-border flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-primary">
                <User size={15} />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {currentUser ? 'Client Identification' : 'Client Access'}
                </h2>
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest block">
                  {currentUser ? 'Verified Consignment Account' : 'Synthetic Test Authentication'}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-muted hover:text-primary transition-colors rounded-tight min-w-[36px] min-h-[36px] flex items-center justify-center border border-transparent hover:border-border"
              aria-label="Close Account Drawer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-[#FAF0E6] border border-[#C43C30]/30 text-[#9E3B33] text-xs rounded-tight flex items-start gap-2">
              <WarningCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 bg-[#EAF2ED] border border-[#2E5A44]/30 text-[#2E5A44] text-xs rounded-tight flex items-center gap-2">
              <Check size={15} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {currentUser ? (
              /* ================= LOGGED IN PROFILE VIEW ================= */
              <div className="space-y-6">
                {/* 1. Profile Summary Card */}
                <div className="p-4 bg-surface border border-border rounded-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <IdentificationBadge size={16} className="text-primary" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                          Client Identification
                        </span>
                      </div>
                      {/* Full Name with Middle Initial */}
                      <h3 className="text-base font-bold text-primary mt-1 tracking-tight">
                        {currentUser.full_name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`}
                      </h3>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 bg-canvas border border-border text-[10px] font-mono uppercase tracking-wider text-primary rounded-tight font-semibold">
                      Tier 01
                    </span>
                  </div>

                  {/* Demographic Badges (Age, DOB, M.I.) */}
                  <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    {currentUser.dob && (
                      <span className="px-2 py-0.5 bg-canvas border border-border rounded-input text-muted">
                        DOB: {currentUser.dob}
                      </span>
                    )}
                    {currentUser.age && (
                      <span className="px-2 py-0.5 bg-canvas border border-border rounded-input text-primary font-semibold">
                        AGE: {currentUser.age}
                      </span>
                    )}
                    {currentUser.middle_initial && (
                      <span className="px-2 py-0.5 bg-canvas border border-border rounded-input text-muted">
                        M.I.: {currentUser.middle_initial}.
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Quick Link to Orders */}
                <Link
                  to="/orders"
                  onClick={handleClose}
                  className="flex items-center justify-between p-4 bg-canvas border border-border rounded-card hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-tight bg-surface border border-border flex items-center justify-center text-primary">
                      <Package size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary block">
                        Order History & Tracking
                      </span>
                      <span className="text-[11px] text-muted font-mono">
                        {userOrders.length} active / past consignment(s)
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted group-hover:text-primary transition-colors" />
                </Link>

                {/* 3. Detailed Demographic & Delivery Edit Card */}
                <div className="p-4 bg-surface border border-border rounded-card">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                      <User size={14} />
                      <span>Demographics & Delivery Details</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="text-xs text-muted hover:text-primary flex items-center gap-1 transition-colors font-medium"
                    >
                      <PencilSimple size={12} />
                      <span>{isEditingProfile ? 'Cancel' : 'Edit Details'}</span>
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                      {/* Name Fields (First Name, M.I., Surname) */}
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={editData.first_name}
                            onChange={(e) => setEditData(p => ({ ...p, first_name: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            M.I.
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={editData.middle_initial}
                            onChange={(e) => setEditData(p => ({ ...p, middle_initial: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary text-center uppercase focus:outline-none focus:border-primary"
                            placeholder="V"
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            Surname *
                          </label>
                          <input
                            type="text"
                            required
                            value={editData.last_name}
                            onChange={(e) => setEditData(p => ({ ...p, last_name: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* DOB & Age Fields */}
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-8">
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            Date of Birth (DOB)
                          </label>
                          <input
                            type="date"
                            value={editData.dob}
                            onChange={handleEditDobChange}
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="120"
                            value={editData.age}
                            onChange={(e) => setEditData(p => ({ ...p, age: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                            placeholder="28"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                          placeholder="+63 917 555 0192"
                        />
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          Delivery Street Address
                        </label>
                        <input
                          type="text"
                          value={editData.address}
                          onChange={(e) => setEditData(p => ({ ...p, address: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                          placeholder="Unit, Street Address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            City / District
                          </label>
                          <input
                            type="text"
                            value={editData.city}
                            onChange={(e) => setEditData(p => ({ ...p, city: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                            placeholder="Taguig City"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={editData.postal_code}
                            onChange={(e) => setEditData(p => ({ ...p, postal_code: e.target.value }))}
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                            placeholder="1634"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2.5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 transition-opacity min-h-[38px]"
                      >
                        Save Updated Details
                      </button>
                    </form>
                  ) : (
                    <div className="mt-3 text-xs text-muted space-y-2">
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/60">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-muted/70 block">Legal Name</span>
                          <span className="font-medium text-primary">{currentUser.full_name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-muted/70 block">DOB / Age</span>
                          <span className="font-mono text-primary">
                            {currentUser.dob || '—'} {currentUser.age ? `(${currentUser.age} yrs)` : ''}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono text-muted/70 block">Saved Delivery Address</span>
                        <p className="font-medium text-primary mt-0.5">
                          {currentUser.address || 'No street address saved.'}
                        </p>
                        <p>
                          {[currentUser.city, currentUser.postal_code, currentUser.country]
                            .filter(Boolean)
                            .join(', ') || 'No city saved.'}
                        </p>
                      </div>

                      {currentUser.phone && (
                        <p className="font-mono text-[11px] pt-1 border-t border-border/40">
                          Contact Phone: {currentUser.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Sign Out */}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      signOut();
                      setSuccessMsg('Signed out to guest mode.');
                      setTimeout(() => setSuccessMsg(''), 1500);
                    }}
                    className="w-full py-3 bg-surface hover:bg-surface-subtle border border-border text-muted hover:text-primary text-xs font-semibold uppercase tracking-wider rounded-tight flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                  >
                    <SignOut size={15} />
                    <span>Sign Out to Guest Mode</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= LOGGED OUT (SIGN IN / REGISTER) ================= */
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                      authMode === 'signin'
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-muted hover:text-primary'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                      authMode === 'signup'
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-muted hover:text-primary'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {authMode === 'signin' ? (
                  /* --- SIGN IN WITH FAKE GMAIL & PASSWORD --- */
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                        Fake Gmail / Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          placeholder="marcus.thorne@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary transition-colors"
                          required
                        />
                        <Envelope size={14} className="absolute right-3 top-3 text-muted" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary transition-colors"
                          required
                        />
                        <Lock size={14} className="absolute right-3 top-3 text-muted" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:opacity-90 active:scale-[0.99] transition-all min-h-[44px]"
                    >
                      Sign In
                    </button>

                    {/* Quick Demo Fill Helper */}
                    <div className="pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={handleQuickDemoFill}
                        className="w-full py-2.5 bg-surface hover:bg-surface-subtle border border-border text-muted hover:text-primary text-[11px] font-mono uppercase tracking-wider rounded-tight flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkle size={13} />
                        <span>Quick Demo Fill (Marcus V. Thorne)</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* --- REGISTER WITH NAME, M.I., SURNAME, DOB, AGE, FAKE GMAIL --- */
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* First Name, M.I., Surname */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={signUpData.first_name}
                          onChange={(e) => setSignUpData(p => ({ ...p, first_name: e.target.value }))}
                          placeholder="Marcus"
                          className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          M.I.
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={signUpData.middle_initial}
                          onChange={(e) => setSignUpData(p => ({ ...p, middle_initial: e.target.value }))}
                          placeholder="V"
                          className="w-full px-2 py-2 bg-surface border border-border rounded-input text-xs text-primary text-center uppercase focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          Surname *
                        </label>
                        <input
                          type="text"
                          required
                          value={signUpData.last_name}
                          onChange={(e) => setSignUpData(p => ({ ...p, last_name: e.target.value }))}
                          placeholder="Thorne"
                          className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Date of Birth & Age (Auto-calculated) */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-8">
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          Date of Birth (DOB)
                        </label>
                        <input
                          type="date"
                          value={signUpData.dob}
                          onChange={handleSignUpDobChange}
                          className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          Age (Auto)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={signUpData.age}
                          onChange={(e) => setSignUpData(p => ({ ...p, age: e.target.value }))}
                          placeholder="28"
                          className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>

                    {/* Fake Gmail Address */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                        Fake Gmail / Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(p => ({ ...p, email: e.target.value }))}
                        placeholder="client.name@gmail.com"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(p => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+63 917 555 0192"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Address Fields */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                        Delivery Address (Optional)
                      </label>
                      <input
                        type="text"
                        value={signUpData.address}
                        onChange={(e) => setSignUpData(p => ({ ...p, address: e.target.value }))}
                        placeholder="Unit, Street Address"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={signUpData.city}
                          onChange={(e) => setSignUpData(p => ({ ...p, city: e.target.value }))}
                          placeholder="Taguig City"
                          className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-muted mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={signUpData.postal_code}
                          onChange={(e) => setSignUpData(p => ({ ...p, postal_code: e.target.value }))}
                          placeholder="1634"
                          className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:opacity-90 active:scale-[0.99] transition-all min-h-[44px]"
                    >
                      Register Client Account
                    </button>
                  </form>
                )}

                {/* Synthetic assurance note */}
                <div className="p-3 bg-surface border border-border rounded-tight text-center">
                  <p className="text-[11px] text-muted leading-relaxed font-mono">
                    Synthetic test accounts only. No real Google OAuth or real verification emails needed.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
