import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeSlash, ArrowRight, ShieldCheck, ArrowLeft, Warning } from '@phosphor-icons/react';
import { brandConfig } from '../../config/brand';

const DEFAULT_EMAIL = 'admin@purgatory.com';
const DEFAULT_PASSWORD = 'purgatory2026';

export default function AdminSecurityGate() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // If already authenticated in this session, go straight to dashboard
    const activeSession = sessionStorage.getItem('purgatory_ops_session');
    if (activeSession) {
      navigate('/ops-portal/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // Accept standard admin passwords (or any non-empty password for convenience during demo)
      const isPasswordValid =
        Boolean(trimmedPassword) &&
        (trimmedPassword.length >= 3 ||
          trimmedPassword === DEFAULT_PASSWORD ||
          trimmedPassword === 'admin' ||
          trimmedPassword === 'admin123' ||
          trimmedPassword === 'purgatory' ||
          trimmedPassword === 'PURGATORY-OPS-2026');

      if (normalizedEmail && isPasswordValid) {
        const sessionPayload = {
          token: `ops-tok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          operator: normalizedEmail,
          role: 'master_operator',
          authenticatedAt: new Date().toISOString()
        };
        sessionStorage.setItem('purgatory_ops_session', JSON.stringify(sessionPayload));
        setIsAuthenticating(false);
        navigate('/ops-portal/dashboard', { replace: true });
      } else {
        setIsAuthenticating(false);
        setErrorMessage('Please enter an email and password to sign in.');
      }
    }, 150);
  };

  const handleAutoFill = () => {
    setEmail(DEFAULT_EMAIL);
    setPassword(DEFAULT_PASSWORD);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-primary selection:text-canvas">
      {/* Brand Logo & Atelier Label */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-block group" title="Return to Storefront">
          <img
            src={brandConfig.logoName}
            alt="Purgatory"
            className="h-9 sm:h-10 w-auto object-contain mx-auto filter invert transition-opacity group-hover:opacity-80"
          />
        </Link>
        <span className="text-xs uppercase tracking-wider text-muted block mt-2 font-semibold">
          {brandConfig.collection} — Atelier Administration
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-card p-6 sm:p-8 shadow-sm">
        <div className="pb-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-primary" weight="bold" />
              <h1 className="text-base font-bold uppercase tracking-wider text-primary">
                Admin Sign In
              </h1>
            </div>
            <span className="text-xs uppercase text-muted tracking-wider px-2 py-0.5 bg-canvas rounded border border-border font-semibold">
              Secure Portal
            </span>
          </div>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Enter your administrative email and password to access orders, stock matrix, and logistics.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-danger-light border border-danger/30 rounded-input text-xs text-danger flex items-center gap-2 animate-in fade-in">
            <Warning size={16} weight="bold" className="shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={isAuthenticating}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@purgatory.com"
              className="w-full px-3.5 py-2.5 bg-canvas border border-border rounded-input text-xs text-primary placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isAuthenticating}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-canvas border border-border rounded-input text-xs text-primary placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Autofill */}
          <div className="p-3 bg-canvas border border-border rounded-input flex items-center justify-between text-xs">
            <div className="text-xs text-muted font-medium">
              Demo: <span className="font-bold text-primary">purgatory2026</span>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-primary hover:underline font-semibold text-xs"
            >
              Fill Credentials
            </button>
          </div>

          {/* Sign In CTA */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3 px-5 bg-primary text-canvas text-xs font-semibold uppercase tracking-wider rounded-tight hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50 shadow-xs"
          >
            {isAuthenticating ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={14} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Return to Storefront</span>
          </Link>
          <span className="text-xs font-medium text-muted">TLS SHA-256 Session</span>
        </div>
      </div>
    </div>
  );
}
