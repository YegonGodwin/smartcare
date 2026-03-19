import { Navigate } from 'react-router-dom';
import { getDefaultRouteForRole } from '@components/auth/ProtectedRoute';
import { useAuth } from '@hooks/index';
import { PromoPanel } from './PromoPanel';
import { LoginForm } from './LoginForm';
import { APP_NAME, COMPANY_NAME, SYSTEM_STATUS } from '@constants/index';
import { LeafIcon } from '@components/layout/icons';

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Accessibility', href: '#' },
  { label: 'Contact', href: '#' },
];

export function LoginPage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen login-page relative overflow-hidden">
      <div className="absolute inset-0 login-grid pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 lg:px-16 pt-8 pb-6">
          <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-[#eadfce] flex items-center justify-center text-[#c46a2b]">
                <LeafIcon />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#8c4b20] font-semibold">
                  {COMPANY_NAME}
                </p>
                <p className="text-sm text-slate-600">{APP_NAME}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="login-chip px-3 py-1 rounded-full">{SYSTEM_STATUS.OPERATIONAL}</span>
              <a href="#" className="login-link uppercase tracking-[0.2em] text-[11px]">
                Get Support
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-16 pb-12">
          <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-stretch">
            <section className="login-surface rounded-[2rem] p-8 sm:p-10 lg:p-12">
              <LoginForm />
            </section>
            <PromoPanel />
          </div>
        </main>

        <footer className="px-6 lg:px-16 pb-10">
          <div className="mx-auto w-full max-w-6xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
            <nav className="flex flex-wrap gap-4">
              {footerLinks.map((link) => (
                <a key={link.label} href={link.href} className="login-link text-xs">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}