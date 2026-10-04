import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import NotificationListener from './NotificationListener';

type AdminLayoutProps = {
  children: ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('admin_access_token');
    navigate('/login');
  }

  

  const menuClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">

        <NotificationListener />

      <aside className="w-64 bg-white p-6 shadow">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            WFH Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Admin Panel
          </p>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            className={menuClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/employees"
            className={menuClass}
          >
            Employees
          </NavLink>

          <NavLink
            to="/attendance"
            className={menuClass}
          >
            Attendance
          </NavLink>
        </nav>

        <div className="mt-8 border-t pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-50 px-4 py-3 text-left font-medium text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;