import { useEffect, useState } from 'react';

import { getEmployees } from '../services/employee.service';
import { getAllAttendances } from '../services/attendance.service';

type DashboardStats = {
  totalEmployees: number;
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
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
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
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
  const today = getTodayInWIB();

  const [
    employeeResponse,
    attendanceResponse,
  ] = await Promise.all([
    getEmployees(token, 1, 100),

    getAllAttendances(
      token,
      today,
      today,
      undefined,
      1,
      100,
    ),
  ]);

  const employees = employeeResponse.data;

  const todayAttendances =
    attendanceResponse.data;

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === 'ACTIVE',
    ).length;

  const checkedInToday =
    todayAttendances.filter(
      (attendance) =>
        Boolean(attendance.checkInAt),
    ).length;

  const checkedOutToday =
    todayAttendances.filter(
      (attendance) =>
        Boolean(attendance.checkOutAt),
    ).length;

  setStats({
    totalEmployees:
      employeeResponse.pagination.total,
    activeEmployees,
    checkedInToday,
    checkedOutToday,
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Employees
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalEmployees}
            </p>
          </div>

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