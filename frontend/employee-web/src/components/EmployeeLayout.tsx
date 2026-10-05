import {
  NavLink,
  useNavigate,
} from 'react-router-dom';
import type { ReactNode } from 'react';

type EmployeeLayoutProps = {
  children: ReactNode;
};

function EmployeeLayout({
  children,
}: EmployeeLayoutProps) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem(
      'employee_access_token',
    );

    navigate('/login');
  }

  const desktopMenuClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const mobileMenuClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `flex flex-1 flex-col items-center justify-center px-2 py-3 text-xs font-medium transition ${
      isActive
        ? 'text-blue-600'
        : 'text-gray-500'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-white p-6 shadow md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            WFH Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Employee Panel
          </p>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            className={desktopMenuClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/profile"
            className={desktopMenuClass}
          >
            Profile
          </NavLink>

          <NavLink
            to="/attendance"
            className={desktopMenuClass}
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

      {/* Content */}
      <main className="min-w-0 pb-20 md:ml-64 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white shadow-lg md:hidden">
        <NavLink
          to="/attendance"
          className={mobileMenuClass}
        >
          <span className="mb-1 text-xl">
            ✓
          </span>

          Attendance
        </NavLink>

        <NavLink
          to="/dashboard"
          className={mobileMenuClass}
        >
          <span className="mb-1 text-xl">
            ⌂
          </span>

          Dashboard
        </NavLink>

        <NavLink
          to="/profile"
          className={mobileMenuClass}
        >
          <span className="mb-1 text-xl">
            ♙
          </span>

          Profile
        </NavLink>
      </nav>
    </div>
  );
}

export default EmployeeLayout;