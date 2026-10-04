import { useEffect, useState } from 'react';

import {
  getAttendanceSummary,
  type Attendance,
} from '../services/attendance.service';

function DashboardPage() {
  const [attendance, setAttendance] =
    useState<Attendance | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function getTodayDate() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  useEffect(() => {
    async function loadTodayAttendance() {
      const token = localStorage.getItem(
        'employee_access_token',
      );

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
        const today = getTodayDate();

        const data = await getAttendanceSummary(
          token,
          today,
          today,
        );

        const todayAttendance = data.find(
          (item) =>
            item.attendanceDate.slice(0, 10) === today,
        );

        setAttendance(todayAttendance ?? null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            'Failed to load today attendance',
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadTodayAttendance();
  }, []);

  function formatTime(value: string | null) {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleTimeString(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      },
    );
  }

  function getAttendanceStatus() {
    if (!attendance) {
      return 'Not Checked In';
    }

    if (attendance.checkOutAt) {
      return 'Completed';
    }

    return 'Checked In';
  }

  function getStatusClass() {
    if (!attendance) {
      return 'bg-gray-100 text-gray-700';
    }

    if (attendance.checkOutAt) {
      return 'bg-green-100 text-green-700';
    }

    return 'bg-blue-100 text-blue-700';
  }

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            View your attendance status for today.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Today's Attendance
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                {new Date().toLocaleDateString(
                  'id-ID',
                  {
                    timeZone: 'Asia/Jakarta',
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  },
                )}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusClass()}`}
            >
              {getAttendanceStatus()}
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">
                Check In
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatTime(
                  attendance?.checkInAt ?? null,
                )}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">
                Check Out
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatTime(
                  attendance?.checkOutAt ?? null,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;