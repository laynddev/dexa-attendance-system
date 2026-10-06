import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { getMe } from '../services/auth.service';
import { getMyProfile } from '../services/employee.service';

type InactiveRouteProps = {
  children: ReactNode;
};

type RouteStatus =
  | 'checking'
  | 'unauthorized'
  | 'active'
  | 'inactive';

function InactiveRoute({
  children,
}: InactiveRouteProps) {
  const [routeStatus, setRouteStatus] =
    useState<RouteStatus>('checking');

  useEffect(() => {
    async function checkEmployeeStatus() {
      const token = localStorage.getItem(
        'employee_access_token',
      );

      if (!token) {
        setRouteStatus('unauthorized');
        return;
      }

      try {
        const user = await getMe(token);

        if (!user.roles.includes('EMPLOYEE')) {
          localStorage.removeItem(
            'employee_access_token',
          );

          setRouteStatus('unauthorized');
          return;
        }

        const employee = await getMyProfile(token);

        if (employee.status === 'INACTIVE') {
          setRouteStatus('inactive');
          return;
        }

        setRouteStatus('active');
      } catch {
        localStorage.removeItem(
          'employee_access_token',
        );

        setRouteStatus('unauthorized');
      }
    }

    checkEmployeeStatus();
  }, []);

  if (routeStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Checking employee status...
        </p>
      </div>
    );
  }

  if (routeStatus === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (routeStatus === 'active') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default InactiveRoute;