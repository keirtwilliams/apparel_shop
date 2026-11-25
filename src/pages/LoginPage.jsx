import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock, Envelope, ArrowRight, Check, WarningCircle, ArrowLeft, Eye, EyeSlash, X
} from '@phosphor-icons/react';
import { useStore } from '../context/StoreContext';
import { brandConfig } from '../config/brand';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/orders';
  const { signIn } = useStore();

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-dismiss authentication error popup after 2 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => setErrorMsg(''), 2000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInEmail.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn({ email: signInEmail, password: signInPassword });
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
      } else {
        setSuccessMsg(
          redirectTarget === '/checkout'
            ? 'Signed in! Redirecting to checkout...'
            : 'Signed in successfully. Redirecting to your account...'
        );
        setTimeout(() => navigate(redirectTarget), 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface/50 relative">
      {/* ================= TOP-RIGHT FLOATING POP-UP MODAL: ERROR ================= */}
      {errorMsg && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed top-4 inset-x-4 sm:inset-x-auto sm:top-6 sm:right-6 z-50 sm:max-w-sm sm:w-full animate-in fade-in slide-in-from-top-4 duration-300 drop-shadow-2xl"
        >
          <div className="bg-canvas border border-[#C43C30]/40 shadow-2xl rounded-card p-4 flex items-start gap-3 text-primary ring-1 ring-[#C43C30]/20">
            <div className="w-8 h-8 rounded-full bg-danger-light text-[#C43C30] flex items-center justify-center shrink-0 mt-0.5">
              <WarningCircle size={18} weight="bold" />
            </div>
            <div className="flex-1 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C43C30]">
                Authentication Failed
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
              aria-label="Close error notification"
            >
              <X size={14} />
            </button>
          </div>
        </aside>
      )}

      {/* ================= TOP-RIGHT FLOATING POP-UP MODAL: SIGNED IN ================= */}
      {successMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 inset-x-4 sm:inset-x-auto sm:top-6 sm:right-6 z-50 sm:max-w-sm sm:w-full animate-in fade-in slide-in-from-top-4 duration-300 drop-shadow-2xl"
        >
          <div className="bg-canvas border border-[#2E5A44]/40 shadow-2xl rounded-card p-4 flex items-start gap-3 text-primary ring-1 ring-[#2E5A44]/20">
            <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#2E5A44] flex items-center justify-center shrink-0 mt-0.5">
              <Check size={18} weight="bold" />
            </div>
            <div className="flex-1 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                Authentication Confirmed
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {successMsg}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#2E5A44]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2E5A44]" />
                <span>Redirecting to your session...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg('')}
              className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </aside>
      )}

      {/* Centered Avant-Garde Luxury Card Container */}
      <div className="w-full max-w-md bg-canvas border border-border rounded-card p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3" aria-label="Return to Storefront">
            <img
              src={brandConfig.logoName}
              alt="Purgatory"
              className="h-10 sm:h-12 w-auto mx-auto object-contain filter invert"
            />
          </Link>

          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {redirectTarget === '/checkout'
              ? 'Sign in to finalize your bag and proceed with checkout.'
              : 'Access your orders, archived receipts, and exclusive drops.'}
          </p>
        </div>

        {/* SIGN IN FORM */}
        <form onSubmit={handleSignIn} autoComplete="off" className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="login_email_field"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                placeholder="Enter your email"
                required
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <Envelope size={14} className="absolute right-3 top-3 text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="login_password_field"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 pr-10 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted hover:text-primary transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Eye size={15} /> : <EyeSlash size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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

        {/* Link to Dedicated Register Page */}
        <div className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-xs text-muted">
            Don't have an account yet?{' '}
            <Link
              to={redirectTarget === '/checkout' ? '/register?redirect=/checkout' : '/register'}
              className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity ml-1"
            >
              Register here
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
}
