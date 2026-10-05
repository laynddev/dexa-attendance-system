import { useState } from 'react';
import {
  NavLink,
  useNavigate,
} from 'react-router-dom';
import type { ReactNode } from 'react';

import NotificationListener from './NotificationListener';

type AdminLayoutProps = {
  children: ReactNode;
};

function AdminLayout({
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarVisible, setSidebarVisible] =
    useState(true);

  function handleLogout() {
    localStorage.removeItem(
      'admin_access_token',
    );

    navigate('/login');
  }

  function closeMobileSidebar() {
    setSidebarOpen(false);
  }

  const menuClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <NotificationListener />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white p-6 shadow
          transition-transform duration-300
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
          md:translate-x-0
          ${
            sidebarVisible
              ? 'md:block'
              : 'md:hidden'
          }
        `}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              WFH Attendance
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Admin Panel
            </p>
          </div>

          {/* Close Mobile */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            onClick={closeMobileSidebar}
            className={menuClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/employees"
            onClick={closeMobileSidebar}
            className={menuClass}
          >
            Employees
          </NavLink>

          <NavLink
            to="/attendance"
            onClick={closeMobileSidebar}
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

      {/* Main Content */}
      <div
        className={`min-w-0 transition-all duration-300 ${
          sidebarVisible
            ? 'md:ml-64'
            : 'md:ml-0'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          {/* Desktop Hide / Show */}
          <button
            type="button"
            onClick={() =>
              setSidebarVisible(
                (current) => !current,
              )
            }
            className="hidden rounded-lg border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-100 md:block"
          >
            ☰
          </button>

          <div className="ml-3 md:ml-4">
            <p className="font-semibold text-gray-900">
              Admin Panel
            </p>
          </div>
        </header>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;