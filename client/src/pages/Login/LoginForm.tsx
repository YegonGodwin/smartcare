import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/index';
import { Button, Input, Checkbox } from '@components/ui/index';
import { MailIcon, KeyIcon, EyeIcon, EyeOffIcon } from '@components/layout/icons';
import { getDefaultRouteForRole } from '@components/auth/ProtectedRoute';

type Role = 'patient' | 'doctor' | 'admin';

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [activeRole, setActiveRole] = useState<Role>('patient');
  const [roleError, setRoleError] = useState<string | null>(null);

  const roleOptions: Array<{ value: Role; title: string; description: string }> = [
    {
      value: 'patient',
      title: 'Patient access',
      description: 'View appointments, prescriptions, and visit notes.',
    },
    {
      value: 'doctor',
      title: 'Clinician access',
      description: 'Manage schedules, notes, and patient records.',
    },
  ];

  const activeRoleLabel =
    activeRole === 'admin'
      ? 'Administrator'
      : activeRole.charAt(0).toUpperCase() + activeRole.slice(1);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setRoleError(null);

    try {
      const user = await login(email, password);

      if (user.role !== activeRole) {
        setRoleError(`This account is registered as ${user.role}, not ${activeRole}.`);
        return;
      }

      navigate(getDefaultRouteForRole(user.role));
    } catch (_submitError) {
      return;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-[#8c4b20] font-semibold">
          Secure sign-in
        </p>
        <div>
          <h2 className="text-4xl text-slate-900 font-semibold">Sign in to your workspace</h2>
          <p className="text-slate-600 mt-2">
            Use your assigned email to access protected clinical tools and patient data.
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">Choose access</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {roleOptions.map((role) => (
            <button
              key={role.value}
              type="button"
              aria-pressed={activeRole === role.value}
              onClick={() => {
                clearError();
                setRoleError(null);
                setActiveRole(role.value);
              }}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                activeRole === role.value
                  ? 'border-[#c46a2b] bg-white shadow-sm'
                  : 'border-[#eadfce] bg-white/60 hover:border-[#c46a2b]/40 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{role.title}</p>
                  <p className="text-xs text-slate-500">{role.description}</p>
                </div>
                <span
                  className={`h-3 w-3 rounded-full border ${
                    activeRole === role.value ? 'border-[#c46a2b] bg-[#c46a2b]' : 'border-slate-300'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
        {roleError && (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            role="alert"
          >
            {roleError}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">
            Work email
          </label>
          <Input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              clearError();
              setRoleError(null);
              setEmail(e.target.value);
            }}
            placeholder="name@healthcare.org"
            autoComplete="username"
            inputMode="email"
            required
            className="rounded-xl border-[#eadfce] bg-white focus-within:border-[#c46a2b] focus-within:ring-[#c46a2b]/20"
            icon={<MailIcon />}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">
              Password
            </label>
            <a
              href="#"
              className="text-[11px] uppercase tracking-[0.3em] text-slate-500 hover:text-[#c46a2b] transition-colors"
            >
              Forgot password
            </a>
          </div>
          <Input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              clearError();
              setRoleError(null);
              setPassword(e.target.value);
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="rounded-xl border-[#eadfce] bg-white focus-within:border-[#c46a2b] focus-within:ring-[#c46a2b]/20"
            icon={<KeyIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-[#c46a2b] transition-colors mr-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox
            label="Remember this device"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="text-slate-700"
          />
          <span className="text-xs text-slate-400">Do not use on shared devices.</span>
        </div>

        {error && (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          isLoading={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 text-base font-semibold shadow-xl shadow-slate-900/20 group transition-all"
        >
          <span>Continue as {activeRoleLabel}</span>
          <svg
            className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Button>
      </form>

      <div className="mt-10 pt-8 border-t border-[#eadfce] flex flex-col items-start gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>New to SmartCare?</span>
          <Link to="/register" className="font-semibold text-[#c46a2b] hover:text-[#a95520] transition-colors">
            Create an account
          </Link>
        </div>

        <button
          onClick={() => {
            clearError();
            setRoleError(null);
            setActiveRole('admin');
          }}
          className={`text-[11px] uppercase tracking-[0.35em] transition-all ${
            activeRole === 'admin' ? 'text-[#c46a2b]' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          Staff and administrator access
        </button>
      </div>
    </div>
  );
}