import { Header, Footer } from '@components/layout';
import { Navigate } from 'react-router-dom';
import { getDefaultRouteForRole } from '@components/auth/ProtectedRoute';
import { useAuth } from '@hooks/index';
import { PromoPanel } from './PromoPanel';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px]" />
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          <div className="hidden lg:block">
            <PromoPanel />
          </div>
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
