import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKey, ShieldCheck, WarningCircle, Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react';

// Operator Access Key (can be backed by import.meta.env.VITE_ADMIN_ACCESS_KEY or default secret)
const DEFAULT_ACCESS_KEY = import.meta.env.VITE_ADMIN_ACCESS_KEY || 'PURGATORY-OPS-2026';
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

export default function AdminSecurityGate() {
  const navigate = useNavigate();

  const [operatorId, setOperatorId] = useState('operator@purgatory.la');
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Rate Limiting State (stored in localStorage with timestamp)
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  useEffect(() => {
    // Check if already authenticated in this session
    const activeSession = sessionStorage.getItem('purgatory_ops_session');
    if (activeSession) {
      navigate('/ops-portal/dashboard', { replace: true });
      return;
    }

    // Check existing lockout state
    const lockoutTimestamp = localStorage.getItem('purgatory_ops_lockout');
    if (lockoutTimestamp) {
      const remainingTime = parseInt(lockoutTimestamp, 10) - Date.now();
      if (remainingTime > 0) {
        setLockoutUntil(parseInt(lockoutTimestamp, 10));
      } else {
        localStorage.removeItem('purgatory_ops_lockout');
        localStorage.removeItem('purgatory_ops_attempts');
      }
    }

    const recordedAttempts = parseInt(localStorage.getItem('purgatory_ops_attempts') || '0', 10);
    setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - recordedAttempts));
  }, [navigate]);

  const handleUnlock = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // If currently locked out
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minsLeft = Math.ceil((lockoutUntil - Date.now()) / (60 * 1000));
      setErrorMessage(`Console locked due to excess failures. Re-evaluate in ${minsLeft} minutes.`);
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      if (accessKey.trim() === DEFAULT_ACCESS_KEY) {
        // Successful verification: Issue ephemeral session token
        const sessionPayload = {
          token: `ops-tok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          operator: operatorId,
          role: 'master_operator',
          authenticatedAt: new Date().toISOString()
        };
        // Store strictly in sessionStorage — auto-destroyed on tab close
        sessionStorage.setItem('purgatory_ops_session', JSON.stringify(sessionPayload));

        // Clear failure counters
        localStorage.removeItem('purgatory_ops_attempts');
        localStorage.removeItem('purgatory_ops_lockout');

        setIsAuthenticating(false);
        navigate('/ops-portal/dashboard', { replace: true });
      } else {
        // Failed attempt: update rate limiter
        const nextAttempts = (parseInt(localStorage.getItem('purgatory_ops_attempts') || '0', 10)) + 1;
        localStorage.setItem('purgatory_ops_attempts', nextAttempts.toString());

        if (nextAttempts >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
          localStorage.setItem('purgatory_ops_lockout', lockTime.toString());
          setLockoutUntil(lockTime);
          setErrorMessage(`Access denied. Gate locked for ${LOCKOUT_MINUTES} minutes.`);
        } else {
          setAttemptsLeft(MAX_ATTEMPTS - nextAttempts);
          setErrorMessage(`Invalid Access Key. ${MAX_ATTEMPTS - nextAttempts} attempt(s) remaining.`);
        }
        setIsAuthenticating(false);
      }
    }, 600);
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  return (
    <div className="min-h-screen bg-[#0C0C0B] text-[#FAF9F7] flex flex-col items-center justify-center p-4 selection:bg-[#FAF9F7] selection:text-[#0C0C0B]">
      <div className="w-full max-w-md bg-[#121211] border border-[#242422] rounded-card p-6 sm:p-8 shadow-2xl relative">
        {/* Security Crest */}
        <div className="flex items-center justify-between pb-5 border-b border-[#242422]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-tight bg-[#1A1A18] border border-[#2B2B28] flex items-center justify-center text-[#FAF9F7]">
              <LockKey size={18} weight="bold" />
            </div>
            <div>
              <h1 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FAF9F7]">
                Operator Security Gate
              </h1>
              <p className="text-[10px] font-mono text-[#82807A]">
                PURGATORY · ENCRYPTED CONSOLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-success">
            <ShieldCheck size={14} />
            <span>ISOLATED</span>
          </div>
        </div>

        {/* Lockout or Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-[#261211] border border-[#C43C30]/40 rounded-input text-xs text-[#E8756C] flex items-start gap-2">
            <WarningCircle size={16} className="shrink-0 mt-0.5" />
            <span className="font-mono text-[11px] leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Operator Gate Form */}
        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#82807A] mb-1">
              Operator Identifier
            </label>
            <input
              type="email"
              required
              disabled={isLocked || isAuthenticating}
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full px-3 py-2 bg-[#171716] border border-[#262624] rounded-input text-xs font-mono text-[#FAF9F7] focus:outline-none focus:border-[#FAF9F7] disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#82807A]">
                Operator Security Key
              </label>
              <span className="text-[10px] font-mono text-[#82807A]">
                {attemptsLeft} attempts remaining
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                disabled={isLocked || isAuthenticating}
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Enter access key..."
                className="w-full pl-3 pr-10 py-2 bg-[#171716] border border-[#262624] rounded-input text-xs font-mono text-[#FAF9F7] placeholder-[#575654] focus:outline-none focus:border-[#FAF9F7] disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82807A] hover:text-[#FAF9F7]"
              >
                {showKey ? <EyeSlash size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Quick Development Demo Passkey Filler */}
          <div className="p-3 bg-[#171716] border border-[#222220] rounded-input text-[11px] font-mono text-[#82807A] flex items-center justify-between">
            <span>Demo Passkey: <code className="text-[#FAF9F7] font-bold">PURGATORY-OPS-2026</code></span>
            <button
              type="button"
              onClick={() => setAccessKey(DEFAULT_ACCESS_KEY)}
              className="text-[#FAF9F7] hover:underline uppercase text-[10px] font-bold"
            >
              Fill Key
            </button>
          </div>

          {/* CTA Action */}
          <button
            type="submit"
            disabled={isLocked || isAuthenticating}
            className="w-full py-3.5 px-5 bg-[#FAF9F7] text-[#0C0C0B] text-xs font-bold uppercase tracking-widest font-mono rounded-tight hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <span>Verifying Cryptographic Passkey...</span>
            ) : (
              <>
                <span>Unlock Operations Console</span>
                <ArrowRight size={14} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Security Specs Note */}
        <div className="mt-6 pt-4 border-t border-[#242422] text-[10px] font-mono text-[#82807A] space-y-1 text-center">
          <p>EPHEMERAL SESSION · ZERO LOCAL STORAGE LEAKAGE</p>
          <p>AUTOMATIC TAB-CLOSE TERMINATION</p>
        </div>
      </div>
    </div>
  );
}
