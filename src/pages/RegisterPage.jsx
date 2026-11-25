import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Lock, ArrowRight, Check, WarningCircle, ArrowLeft, Eye, EyeSlash, X, Envelope, Key, ArrowClockwise, ShieldCheck
} from '@phosphor-icons/react';
import { useStore, calculateAge, isPasswordComplex } from '../context/StoreContext';
import { brandConfig } from '../config/brand';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/orders';
  const { signUp, confirmRegistration, resendVerificationCode } = useStore();

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

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email confirmation state
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [pendingAccount, setPendingAccount] = useState(null);
  const [isSupabaseAuth, setIsSupabaseAuth] = useState(false);
  const [expectedCode, setExpectedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [isResending, setIsResending] = useState(false);

  // 8-character segmented OTP inputs (supports Supabase 8-digit tokens & 6-digit OTPs)
  const [digits, setDigits] = useState(['', '', '', '', '', '', '', '']);
  const digitInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  const handleDigitChange = (index, value) => {
    // Accept alphanumeric character (uppercase)
    const cleanChar = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanChar;
    setDigits(newDigits);
    setEnteredCode(newDigits.join(''));

    // Auto-focus next input if filled
    if (cleanChar && index < 7) {
      digitInputRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitInputRefs[index - 1].current?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);
    setEnteredCode(newDigits.join(''));

    // Focus the box following the last pasted char
    const nextIdx = Math.min(pastedData.length, 7);
    digitInputRefs[nextIdx].current?.focus();
  };

  // Check if error is related to an existing account
  const isAccountExistsError =
    errorMsg.toLowerCase().includes('already') ||
    errorMsg.toLowerCase().includes('exists');

  // Live password complexity checks
  const pwd = signUpData.password;
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleDobChange = (e) => {
    const dobValue = e.target.value;
    const computedAge = calculateAge(dobValue);
    setSignUpData(prev => ({
      ...prev,
      dob: dobValue,
      age: computedAge !== '' ? computedAge.toString() : prev.age
    }));
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

    // Password validation guard
    if (!isPasswordValid) {
      setErrorMsg('Password does not meet complexity requirements. Please satisfy all 5 requirements listed below.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp(signUpData);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else if (res.verificationRequired) {
        setPendingAccount(res.pendingAccount);
        setIsSupabaseAuth(Boolean(res.isSupabaseAuth));
        setExpectedCode(res.verificationCode || '');
        setStep('verify');
        if (res.isSupabaseAuth) {
          setSuccessMsg(`Confirmation email dispatched directly to ${signUpData.email}! Check your inbox for your confirmation code.`);
        } else if (res.emailSent) {
          if (res.relayedToOwner) {
            setSuccessMsg(`Resend Sandbox Notice: Code was sent to account owner (${res.ownerEmail}) because custom domain is not yet verified.`);
          } else {
            setSuccessMsg(`Confirmation code sent to ${signUpData.email}! Please enter the code to activate your account.`);
          }
        } else {
          setErrorMsg(res.emailError || 'Failed to dispatch confirmation email to your address.');
        }
      } else {
        setSuccessMsg(
          redirectTarget === '/checkout'
            ? 'Account registered! Proceeding to checkout...'
            : 'Account registered and profile created successfully.'
        );
        setTimeout(() => navigate(redirectTarget), 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = enteredCode.trim();
    if (!trimmed || (trimmed.length !== 6 && trimmed.length !== 8)) {
      setErrorMsg('Please enter the complete verification code (6 or 8 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await confirmRegistration(pendingAccount, trimmed, expectedCode, isSupabaseAuth);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid confirmation code.');
      } else {
        setSuccessMsg('Account verified and confirmed! Redirecting...');
        setTimeout(() => navigate(redirectTarget), 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingAccount || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    setResendStatus('Dispatching fresh code...');

    try {
      const res = await resendVerificationCode(pendingAccount.email, pendingAccount.full_name, isSupabaseAuth);
      if (res.success) {
        if (!isSupabaseAuth && res.newCode) {
          setExpectedCode(res.newCode);
        }
        setResendStatus('New confirmation email sent to your inbox!');
        setTimeout(() => setResendStatus(''), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to resend code. Please try again.');
        setResendStatus('');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface/50 relative">
      {/* ================= TOP-RIGHT FLOATING POP-UP MODAL: SUCCESSFUL ACCOUNT CREATION / CODE SENT ================= */}
      {successMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 drop-shadow-2xl"
        >
          <div className="bg-canvas border border-[#2E5A44]/40 shadow-2xl rounded-card p-4 flex items-start gap-3 text-primary ring-1 ring-[#2E5A44]/20">
            <div className="w-8 h-8 rounded-full bg-[#EAF2ED] text-[#2E5A44] flex items-center justify-center shrink-0 mt-0.5">
              <Check size={18} weight="bold" />
            </div>
            <div className="flex-1 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                {step === 'verify' ? 'Verification Dispatched' : 'Account Created Successfully'}
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {successMsg}
              </p>
              {step !== 'verify' && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-[#2E5A44]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2E5A44] animate-ping" />
                  <span>Redirecting to your session...</span>
                </div>
              )}
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

      {/* ================= TOP-RIGHT FLOATING POP-UP MODAL: ACCOUNT ALREADY EXISTS ================= */}
      {isAccountExistsError && (
        <aside
          role="alert"
          className="fixed top-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 drop-shadow-2xl"
        >
          <div className="bg-canvas border border-[#C43C30]/40 shadow-2xl rounded-card p-4 flex items-start gap-3 text-primary ring-1 ring-[#C43C30]/20">
            <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#C43C30] flex items-center justify-center shrink-0 mt-0.5">
              <WarningCircle size={18} weight="bold" />
            </div>
            <div className="flex-1 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                Account Already Exists
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                An account with this email address has already been created. Sign in below to access your profile.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  to={redirectTarget === '/checkout' ? '/login?redirect=/checkout' : '/login'}
                  className="px-3.5 py-1.5 bg-primary text-canvas text-[11px] font-bold uppercase tracking-wider rounded-tight hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Sign In Now</span>
                  <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
              aria-label="Close alert"
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
            {step === 'verify'
              ? 'Enter the confirmation code dispatched to your email.'
              : redirectTarget === '/checkout'
                ? 'Create your client profile to finalize order consignment.'
                : 'Register for archival drops, orders, and private allocations.'}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && !isAccountExistsError && (
          <div className="mb-5 p-3.5 bg-danger-light border border-danger/30 rounded-tight text-xs text-danger flex items-start gap-2.5">
            <WarningCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {resendStatus && (
          <div className="mb-5 p-3.5 bg-success-light border border-success/30 rounded-tight text-xs text-success flex items-start gap-2.5">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{resendStatus}</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION FORM */}
        {step === 'form' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={signUpData.first_name}
                  onChange={(e) => setSignUpData(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="First name"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                  M.I.
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={signUpData.middle_initial}
                  onChange={(e) => setSignUpData(p => ({ ...p, middle_initial: e.target.value }))}
                  placeholder="M.I."
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={signUpData.last_name}
                  onChange={(e) => setSignUpData(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="Surname"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
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
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                  Age
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
              <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                value={signUpData.email}
                onChange={(e) => setSignUpData(p => ({ ...p, email: e.target.value }))}
                placeholder=""
                className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={signUpData.city}
                  onChange={(e) => setSignUpData(p => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={signUpData.phone}
                  onChange={(e) => setSignUpData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-primary tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 pr-10 bg-surface border border-border rounded-input text-xs text-primary focus:outline-none focus:border-primary font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted hover:text-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Eye size={14} /> : <EyeSlash size={14} />}
                </button>
              </div>

              {/* Live Password Complexity Checklist */}
              <div className="mt-2.5 p-3 bg-surface border border-border rounded-tight space-y-1 text-[11px] font-sans">
                <span className="text-[10px] uppercase tracking-wider text-primary block mb-1 font-bold">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  <div className={`flex items-center gap-1.5 transition-colors ${hasMinLen ? 'text-[#2E5A44] font-semibold' : 'text-muted'}`}>
                    {hasMinLen ? <Check size={12} weight="bold" /> : <span className="w-3 text-center">•</span>}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasUpper ? 'text-[#2E5A44] font-semibold' : 'text-muted'}`}>
                    {hasUpper ? <Check size={12} weight="bold" /> : <span className="w-3 text-center">•</span>}
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasLower ? 'text-[#2E5A44] font-semibold' : 'text-muted'}`}>
                    {hasLower ? <Check size={12} weight="bold" /> : <span className="w-3 text-center">•</span>}
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-[#2E5A44] font-semibold' : 'text-muted'}`}>
                    {hasNumber ? <Check size={12} weight="bold" /> : <span className="w-3 text-center">•</span>}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 sm:col-span-2 transition-colors ${hasSpecial ? 'text-[#2E5A44] font-semibold' : 'text-muted'}`}>
                    {hasSpecial ? <Check size={12} weight="bold" /> : <span className="w-3 text-center">•</span>}
                    <span>Special char (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[46px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <span>Dispatching Confirmation Email...</span>
              ) : (
                <>
                  <span>Register Client Account</span>
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: EMAIL CODE VERIFICATION (AVANT-GARDE LUXURY ATELIER UI - 8/6 DIGIT SUPPORT) */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {/* Visual Header Box */}
            <div className="p-6 bg-surface border border-border rounded-card text-center relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-[#EAF2ED] text-[#2E5A44] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheck size={28} weight="bold" />
              </div>
              <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-widest block">
                Security Verification
              </span>
              <h3 className="text-base font-bold text-primary mt-1 tracking-tight">
                Confirm Client Access
              </h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed max-w-xs mx-auto">
                A verification code was sent to
              </p>
              <div className="inline-block mt-1 px-3 py-1 bg-canvas border border-border rounded-tight font-mono text-xs font-semibold text-primary">
                {pendingAccount?.email}
              </div>
            </div>

            {/* Segmented OTP Code Input (8-Box Grid) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <label className="text-xs uppercase font-semibold text-primary tracking-wider">
                  Verification Code
                </label>
                <span className="text-[11px] font-mono text-muted">
                  Auto-advancing boxes
                </span>
              </div>

              <div
                className="grid grid-cols-8 gap-1 sm:gap-2"
                onPaste={handleDigitPaste}
              >
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={digitInputRefs[idx]}
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className={`w-full aspect-square text-center text-lg sm:text-xl font-mono font-bold rounded-tight border transition-all ${
                      digit
                        ? 'bg-canvas text-primary border-primary ring-2 ring-primary/20 scale-[1.03]'
                        : 'bg-surface text-primary border-border focus:border-primary focus:bg-canvas focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (enteredCode.length !== 6 && enteredCode.length !== 8)}
              className="w-full py-3.5 bg-primary text-canvas text-xs font-bold uppercase tracking-widest rounded-tight hover:bg-primary/90 active:scale-[0.99] transition-all min-h-[46px] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <span>Activating Client Profile...</span>
              ) : (
                <>
                  <span>Confirm & Activate Access</span>
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>

            {/* Resend Code / Edit Email Controls */}
            <div className="pt-2 flex items-center justify-between text-xs text-muted border-t border-border">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline cursor-pointer disabled:opacity-50"
              >
                <ArrowClockwise size={13} className={isResending ? 'animate-spin' : ''} />
                <span>Resend Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setDigits(['', '', '', '', '', '', '', '']);
                  setEnteredCode('');
                }}
                className="hover:text-primary font-medium transition-colors cursor-pointer"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}

        {/* Link to Dedicated Sign In Page */}
        <div className="mt-6 pt-5 border-t border-border text-center">
          <p className="text-xs text-muted">
            Already have an account?{' '}
            <Link
              to={redirectTarget === '/checkout' ? '/login?redirect=/checkout' : '/login'}
              className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition-opacity ml-1"
            >
              Sign in here
            </Link>
          </p>
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
