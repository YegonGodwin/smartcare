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
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center lg:text-left">
        <h2 className="mb-3 text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Access your personalized {activeRole === 'admin' ? 'administrative' : activeRole} portal to manage health data securely.
        </p>
      </div>

      {/* Role Selection - Only Patient & Doctor visible as primary choices */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8 shadow-inner border border-slate-200">
        <button
          type="button"
          onClick={() => {
            clearError();
            setRoleError(null);
            setActiveRole('patient');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeRole === 'patient'
              ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Patient Login
        </button>
        <button
          type="button"
          onClick={() => {
            clearError();
            setRoleError(null);
            setActiveRole('doctor');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeRole === 'doctor'
              ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.509.37l-1.489-.186a2 2 0 01-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.509.37l-1.489-.186a2 2 0 01-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.509.37l-1.489-.186z" />
          </svg>
          Doctor Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              clearError();
              setRoleError(null);
              setEmail(e.target.value);
            }}
            placeholder="name@hospital.com"
            autoComplete="email"
            required
            className="rounded-2xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 py-3.5 px-4"
            icon={<MailIcon />}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
            <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider">
              Forgot?
            </a>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              clearError();
              setRoleError(null);
              setPassword(e.target.value);
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="rounded-2xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 py-3.5 px-4"
            icon={<KeyIcon />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-300 hover:text-emerald-600 transition-colors mr-2"
                aria-label={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="text-slate-600 font-bold"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {roleError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {roleError}
          </div>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          isLoading={isLoading} 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] py-4 text-base font-bold shadow-xl shadow-emerald-600/20 group transition-all"
        >
          <span>Login to {activeRole === 'admin' ? 'Administration' : activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}</span>
          <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Button>
      </form>

      <div className="mt-10 pt-10 border-t border-slate-100 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 font-medium">New to SmartCare?</span>
          <Link to="/register" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Create an Account
          </Link>
        </div>
        
        {/* Discreet Staff/Admin login link */}
        <button 
          onClick={() => {
            clearError();
            setRoleError(null);
            setActiveRole('admin');
          }}
          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-emerald-600 ${
            activeRole === 'admin' ? 'text-emerald-600' : 'text-slate-300'
          }`}
        >
          Staff & Administrator Login
        </button>
      </div>
    </div>
  );
}
