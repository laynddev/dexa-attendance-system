import { useEffect, useState } from 'react';

import { getEmployees } from '../services/employee.service';
import { getAttendanceStats } from '../services/attendance.service';

type DashboardStats = {
  activeEmployees: number;
  checkedInToday: number;
  checkedOutToday: number;
};

function getTodayInWIB() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function DashboardPage() {
  const [stats, setStats] =
    useState<DashboardStats>({
      activeEmployees: 0,
      checkedInToday: 0,
      checkedOutToday: 0,
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem(
        'admin_access_token',
      );

      if (!token) {
        setError(
          'Authentication token not found',
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const today = getTodayInWIB();

        const [
          employeeResponse,
          attendanceStats,
        ] = await Promise.all([
          getEmployees(
            token,
            1,
            10,
            'ACTIVE',
          ),

          getAttendanceStats(
            token,
            today,
          ),
        ]);

        setStats({
          activeEmployees:
            employeeResponse.pagination.total,

          checkedInToday:
            attendanceStats.checkedIn,

          checkedOutToday:
            attendanceStats.checkedOut,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            'Failed to load dashboard data',
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          WFH Attendance Management System
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Active Employees
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.activeEmployees}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Checked In Today
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.checkedInToday}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Checked Out Today
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.checkedOutToday}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;