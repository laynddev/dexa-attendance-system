import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { getMe } from '../services/auth.service';

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const [authorized, setAuthorized] =
    useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuthorization() {
      const token = localStorage.getItem(
        'employee_access_token',
      );

      if (!token) {
        setAuthorized(false);
        return;
      }

      try {
        const user = await getMe(token);

        if (!user.roles.includes('EMPLOYEE')) {
          localStorage.removeItem(
            'employee_access_token',
          );

          setAuthorized(false);
          return;
        }

        setAuthorized(true);
      } catch {
        localStorage.removeItem(
          'employee_access_token',
        );

        setAuthorized(false);
      }
    }

    checkAuthorization();
  }, []);

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;