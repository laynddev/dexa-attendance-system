import { useEffect, useState } from 'react';

import {
  checkIn,
  checkOut,
  getAttendanceSummary,
  type Attendance,
} from '../services/attendance.service';

function DashboardPage() {
  const [attendance, setAttendance] =
    useState<Attendance | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState('');

  function getTodayDate() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  async function loadTodayAttendance() {
    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      throw new Error(
        'Authentication token not found',
      );
    }

    const today = getTodayDate();

    const data = await getAttendanceSummary(
      token,
      today,
      today,
    );

    const todayAttendance = data.find(
      (item) =>
        item.attendanceDate.slice(0, 10) ===
        today,
    );

    setAttendance(todayAttendance ?? null);
  }

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        await loadTodayAttendance();
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

    loadDashboard();
  }, []);

  async function handleCheckIn() {
    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      setError(
        'Authentication token not found',
      );
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await checkIn(token);

      await loadTodayAttendance();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to check in');
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleCheckOut() {
    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      setError(
        'Authentication token not found',
      );
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await checkOut(token);

      await loadTodayAttendance();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to check out');
      }
    } finally {
      setProcessing(false);
    }
  }

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
      <div className="p-4 text-gray-600 md:p-8">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-600 md:text-base">
            View and manage your attendance for
            today.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 md:text-base">
            {error}
          </div>
        )}

        {/* Today's Attendance */}
        <div className="rounded-xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Today's Attendance
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900 md:text-xl">
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

          {/* Times */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-6">
            <div className="min-w-0 rounded-xl border border-gray-200 p-4 md:p-5">
              <p className="text-xs text-gray-500 md:text-sm">
                Check In
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
                {formatTime(
                  attendance?.checkInAt ?? null,
                )}
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-gray-200 p-4 md:p-5">
              <p className="text-xs text-gray-500 md:text-sm">
                Check Out
              </p>

              <p className="mt-2 text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
                {formatTime(
                  attendance?.checkOutAt ?? null,
                )}
              </p>
            </div>
          </div>

          {/* Attendance Action */}
          <div className="mt-6">
            {!attendance && (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={processing}
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {processing
                  ? 'Processing...'
                  : 'Check In'}
              </button>
            )}

            {attendance &&
              !attendance.checkOutAt && (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={processing}
                  className="w-full rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >
                  {processing
                    ? 'Processing...'
                    : 'Check Out'}
                </button>
              )}

            {attendance?.checkOutAt && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700 md:inline-block">
                Attendance Completed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;