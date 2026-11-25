import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X, User, MapPin, Phone,
  SignOut, Check, WarningCircle, ArrowRight,
  PencilSimple, Package, Calendar, IdentificationBadge
} from '@phosphor-icons/react';
import { useStore, calculateAge } from '../context/StoreContext';

export default function AccountDrawer() {
  const {
    currentUser,
    isAccountDrawerOpen,
    setIsAccountDrawerOpen,
    signOut,
    updateProfile,
    userOrders = []
  } = useStore();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!editData.first_name.trim() || !editData.last_name.trim()) {
      setErrorMsg('First Name and Surname cannot be empty.');
      return;
    }

    updateProfile(editData);
    setIsEditingProfile(false);
    setSuccessMsg('Profile details updated successfully.');
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
        <div className="w-screen max-w-md sm:max-w-lg bg-canvas border-l border-border flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-primary">
                <User size={16} weight="bold" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {currentUser ? 'Client Identification' : 'Client Access'}
                </h2>
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest block">
                  {currentUser ? 'Verified Consignment Account' : 'Guest Browsing Mode'}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-muted hover:text-primary transition-colors rounded-tight min-w-[36px] min-h-[36px] flex items-center justify-center border border-transparent hover:border-border cursor-pointer"
              aria-label="Close Account Drawer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-danger-light border border-danger/30 text-danger text-xs rounded-tight flex items-start gap-2">
              <WarningCircle size={15} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 bg-success-light border border-success/30 text-success text-xs rounded-tight flex items-center gap-2">
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
                      <h3 className="text-base font-bold text-primary mt-1 tracking-tight">
                        {currentUser.full_name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`}
                      </h3>
                      <p className="text-xs text-muted font-mono mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 bg-canvas border border-border text-[10px] font-mono uppercase tracking-wider text-primary rounded-tight font-semibold">
                      Verified Client
                    </span>
                  </div>

                  {/* Demographic Badges (Age, DOB, M.I.) */}
                  {(currentUser.dob || currentUser.age || currentUser.middle_initial) && (
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
                  )}
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
                        {userOrders.length} active / past order(s)
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
                      className="text-xs text-muted hover:text-primary flex items-center gap-1 transition-colors font-medium cursor-pointer"
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
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
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
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                            M.I.
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={editData.middle_initial}
                            onChange={(e) => setEditData(p => ({ ...p, middle_initial: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary text-center uppercase focus:outline-none focus:border-primary"
                            placeholder="M.I."
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
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
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
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
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                            Calculated Age
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={editData.age ? `${editData.age} yrs` : '—'}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-input text-xs text-muted font-mono cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                          Contact Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData(p => ({ ...p, phone: e.target.value }))}
                            placeholder="+1 555 000 0000"
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                          />
                          <Phone size={13} className="absolute right-2.5 top-2.5 text-muted" />
                        </div>
                      </div>

                      {/* Address & City */}
                      <div>
                        <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                          Delivery Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={editData.address}
                            onChange={(e) => setEditData(p => ({ ...p, address: e.target.value }))}
                            placeholder="Apartment, suite, street"
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                          />
                          <MapPin size={13} className="absolute right-2.5 top-2.5 text-muted" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                            City
                          </label>
                          <input
                            type="text"
                            value={editData.city}
                            onChange={(e) => setEditData(p => ({ ...p, city: e.target.value }))}
                            placeholder="City"
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={editData.postal_code}
                            onChange={(e) => setEditData(p => ({ ...p, postal_code: e.target.value }))}
                            placeholder="Postal code"
                            className="w-full px-2.5 py-1.5 bg-canvas border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 py-2.5 bg-primary text-canvas text-xs font-bold uppercase tracking-wider rounded-tight hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        Save Profile Details
                      </button>
                    </form>
                  ) : (
                    /* Read-Only Profile View */
                    <div className="mt-3 space-y-2 text-xs text-primary">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-muted shrink-0 mt-0.5" />
                        <p className="leading-relaxed text-muted">
                          {[currentUser.address, currentUser.city, currentUser.postal_code]
                            .filter(Boolean)
                            .join(', ') || 'No delivery address saved yet.'}
                        </p>
                      </div>

                      {currentUser.phone && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/40 font-mono text-[11px] text-muted">
                          <Phone size={13} className="shrink-0" />
                          <span>Contact: {currentUser.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Sign Out Button */}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      signOut();
                      setSuccessMsg('Signed out to guest mode.');
                      setTimeout(() => {
                        setSuccessMsg('');
                        handleClose();
                      }, 1000);
                    }}
                    className="w-full py-3 bg-surface hover:bg-surface-subtle border border-border text-muted hover:text-primary text-xs font-semibold uppercase tracking-wider rounded-tight flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer"
                  >
                    <SignOut size={15} />
                    <span>Sign Out to Guest Mode</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= LOGGED OUT (GUEST MODE) ================= */
              <div className="space-y-6">
                <div className="p-6 bg-surface border border-border rounded-card text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-canvas border border-border flex items-center justify-center text-primary mb-3">
                    <User size={22} weight="regular" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary font-mono">
                    Guest Browsing Mode
                  </h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed max-w-xs mx-auto">
                    Sign in to your client profile to access real-time order tracking, archived receipts, and exclusive garment drops.
                  </p>
                </div>

                {/* Dedicated Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={handleClose}
                    className="w-full py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight size={15} weight="bold" />
                  </Link>

                  <Link
                    to="/register"
                    onClick={handleClose}
                    className="w-full py-3 bg-surface hover:bg-surface-subtle border border-border text-primary text-xs font-bold uppercase tracking-widest rounded-tight active:scale-[0.99] transition-all min-h-[44px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Register New Client Account</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
