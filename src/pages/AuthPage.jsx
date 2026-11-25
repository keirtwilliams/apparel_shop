import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock, Envelope, User, MapPin, Phone,
  ArrowRight, Check, WarningCircle, ArrowLeft
} from '@phosphor-icons/react';
import { useStore, calculateAge } from '../context/StoreContext';
import { brandConfig } from '../config/brand';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'signup'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, currentUser } = useStore();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up State
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

  const handleDobChange = (e) => {
    const dobValue = e.target.value;
    const computedAge = calculateAge(dobValue);
    setSignUpData(prev => ({
      ...prev,
      dob: dobValue,
      age: computedAge !== '' ? computedAge.toString() : prev.age
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signInEmail || !signInPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn({ email: signInEmail, password: signInPassword });
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed.');
      } else {
        setSuccessMsg('Signed in successfully.');
        setTimeout(() => navigate('/orders'), 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
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

    setIsSubmitting(true);
    try {
      const res = await signUp(signUpData);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else if (res.confirmationRequired) {
        setSuccessMsg(res.message || 'Confirmation link sent! Please check your email inbox.');
      } else {
        setSuccessMsg('Account registered and profile created.');
        setTimeout(() => navigate('/orders'), 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface/50">
      {/* Centered Avant-Garde Luxury Card Container */}
      <div className="w-full max-w-md bg-canvas border border-border rounded-card p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img
              src={brandConfig.logoName}
              alt="Purgatory"
              className="h-10 sm:h-12 w-auto mx-auto object-contain filter invert"
            />
          </Link>
          <h1 className="text-sm font-semibold uppercase tracking-widest text-primary font-mono">
          </h1>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {authMode === 'signin'
              ? 'Access your orders, archived receipts, and exclusive drops.'
              : 'Create your permanent architectural client profile.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex bg-surface p-1 rounded-tight border border-border mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-tight transition-all ${authMode === 'signin'
              ? 'bg-canvas text-primary shadow-xs'
              : 'text-muted hover:text-primary'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-tight transition-all ${authMode === 'signup'
              ? 'bg-canvas text-primary shadow-xs'
              : 'text-muted hover:text-primary'
              }`}
          >
            Register
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-danger-light border border-danger/30 rounded-tight text-xs text-danger flex items-start gap-2.5">
            <WarningCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-success-light border border-success/30 rounded-tight text-xs text-success flex items-start gap-2.5">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="marcus.thorne@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary transition-colors"
                />
                <Envelope size={14} className="absolute right-3 top-3 text-muted" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary transition-colors"
                />
                <Lock size={14} className="absolute right-3 top-3 text-muted" />
              </div>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-muted hover:text-primary transition-colors underline underline-offset-4"
              >
                Auto-fill demo credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Log In to Account</span>
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
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

              <div className="sm:col-span-1">
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                  M.I.
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={signUpData.middle_initial}
                  onChange={(e) => setSignUpData(p => ({ ...p, middle_initial: e.target.value }))}
                  placeholder="V."
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
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

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={signUpData.dob}
                  onChange={handleDobChange}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                  Computed Age
                </label>
                <input
                  type="text"
                  readOnly
                  value={signUpData.age ? `${signUpData.age} years old` : '—'}
                  className="w-full px-3 py-2 bg-surface/60 border border-border rounded-input text-xs text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={signUpData.email}
                onChange={(e) => setSignUpData(p => ({ ...p, email: e.target.value }))}
                placeholder="your.email@gmail.com"
                className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                Password *
              </label>
              <input
                type="password"
                required
                value={signUpData.password}
                onChange={(e) => setSignUpData(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                  City
                </label>
                <input
                  type="text"
                  value={signUpData.city}
                  onChange={(e) => setSignUpData(p => ({ ...p, city: e.target.value }))}
                  placeholder="Iloilo City"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-muted mb-1 font-medium">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+63 917 555 0192"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Register Client Account</span>
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Switch between Sign In and Register */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          {authMode === 'signin' ? (
            <p className="text-xs text-muted">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer ml-1"
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-xs text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer ml-1"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

          {/* Back Link */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary font-mono transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
      );
}
