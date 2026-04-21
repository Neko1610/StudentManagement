import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import type { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const token = auth.getToken();
  const user = auth.getUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      fallback || (
        <Navigate to={`/${role.toLowerCase()}`} replace />
      )
    );
  }

  return <>{children}</>;
}