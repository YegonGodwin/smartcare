import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks';
import type { Role } from '../../model';

interface ProtectedRouteProps {
  roles?: Role[];
}

const roleHomeMap: Record<Role, string> = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
  receptionist: '/dashboard',
};

export function getDefaultRouteForRole(role?: Role) {
  return role ? roleHomeMap[role] : '/login';
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
}
