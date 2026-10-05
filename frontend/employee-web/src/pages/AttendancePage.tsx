import { useEffect, useState } from 'react';

import {
  checkIn,
  checkOut,
  getAttendanceSummary,
  type Attendance,
} from '../services/attendance.service';

function AttendancePage() {
  const getTodayDate = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  };

  const getCurrentMonthStart = () => {
    const today = getTodayDate();

    return `${today.slice(0, 7)}-01`;
  };

  const [todayAttendance, setTodayAttendance] =
    useState<Attendance | null>(null);

  const [attendances, setAttendances] = useState<
    Attendance[]
  >([]);

  const [startDate, setStartDate] = useState(
    getCurrentMonthStart(),
  );

  const [endDate, setEndDate] = useState(
    getTodayDate(),
  );

  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function loadTodayAttendance() {
    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const today = getTodayDate();

    const data = await getAttendanceSummary(
      token,
      today,
      today,
    );

    const attendance = data.find(
      (item) =>
        item.attendanceDate.slice(0, 10) === today,
    );

    setTodayAttendance(attendance ?? null);
  }

  async function loadAttendanceHistory(
    selectedStartDate: string,
    selectedEndDate: string,
  ) {
    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const data = await getAttendanceSummary(
      token,
      selectedStartDate,
      selectedEndDate,
    );

    setAttendances(data);
  }

  async function loadInitialData() {
    setLoading(true);
    setError('');

    try {
      await Promise.all([
        loadTodayAttendance(),
        loadAttendanceHistory(
          startDate,
          endDate,
        ),
      ]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load attendance');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handleCheckIn() {
    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      setError('Authentication token not found');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await checkIn(token);

      await Promise.all([
        loadTodayAttendance(),
        loadAttendanceHistory(
          startDate,
          endDate,
        ),
      ]);
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
      setError('Authentication token not found');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await checkOut(token);

      await Promise.all([
        loadTodayAttendance(),
        loadAttendanceHistory(
          startDate,
          endDate,
        ),
      ]);
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

  async function handleFilter() {
    if (!startDate || !endDate) {
      setError(
        'Start date and end date are required',
      );
      return;
    }

    if (startDate > endDate) {
      setError(
        'Start date cannot be greater than end date',
      );
      return;
    }

    setFiltering(true);
    setError('');

    try {
      await loadAttendanceHistory(
        startDate,
        endDate,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load attendance');
      }
    } finally {
      setFiltering(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
      },
    );
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

  if (loading) {
    return (
      <div className="p-4 md:p-8 text-gray-600">
        Loading attendance...
      </div>
    );
  }

  return (
  <div className="p-4 md:p-8">
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Attendance
        </h1>

        <p className="mt-2 text-sm text-gray-600 md:text-base">
          Check in, check out, and view your
          attendance history.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 md:text-base">
          {error}
        </div>
      )}

      {/* Today's Attendance */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow md:mb-8 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Today's Attendance
        </h2>

        <div className="mt-5 grid grid-cols-3 gap-3 md:gap-6">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 md:text-sm">
              Date
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900 md:text-base">
              {new Date().toLocaleDateString(
                'id-ID',
                {
                  timeZone: 'Asia/Jakarta',
                },
              )}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-500 md:text-sm">
              Check In
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900 md:text-base">
              {formatTime(
                todayAttendance?.checkInAt ??
                  null,
              )}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-500 md:text-sm">
              Check Out
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900 md:text-base">
              {formatTime(
                todayAttendance?.checkOutAt ??
                  null,
              )}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {!todayAttendance && (
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

          {todayAttendance &&
            !todayAttendance.checkOutAt && (
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

          {todayAttendance?.checkOutAt && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700 md:inline-block">
              Attendance Completed
            </div>
          )}
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow md:p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Attendance Summary
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select a date range to view your
          attendance history.
        </p>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              max={getTodayDate()}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none md:px-4"
            />
          </div>

          <div className="min-w-0 flex-1">
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              max={getTodayDate()}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:outline-none md:px-4"
            />
          </div>

          <button
            type="button"
            onClick={handleFilter}
            disabled={filtering}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            {filtering
              ? 'Loading...'
              : 'Filter'}
          </button>
        </div>
      </div>

        {/* Attendance History */}
<div className="rounded-xl bg-white shadow">
  <div className="border-b px-4 py-4 md:px-6">
    <h2 className="text-lg font-semibold text-gray-900">
      Attendance History
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      {startDate} - {endDate}
    </p>
  </div>

  {/* Mobile History */}
  <div className="divide-y md:hidden">
    {attendances.map((attendance) => (
      <div
        key={attendance.id}
        className="p-4"
      >
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Date
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {formatDate(
              attendance.attendanceDate,
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Check In
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {formatTime(
                attendance.checkInAt,
              )}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Check Out
            </p>

            <p className="mt-1 font-semibold text-gray-900">
              {formatTime(
                attendance.checkOutAt,
              )}
            </p>
          </div>
        </div>
      </div>
    ))}

    {attendances.length === 0 && (
      <div className="px-4 py-8 text-center text-sm text-gray-500">
        No attendance records found.
      </div>
    )}
  </div>

  {/* Desktop History */}
  <div className="hidden overflow-x-auto md:block">
    <table className="w-full text-left">
      <thead className="bg-gray-50 text-sm text-gray-600">
        <tr>
          <th className="px-6 py-4">
            Date
          </th>

          <th className="px-6 py-4">
            Check In
          </th>

          <th className="px-6 py-4">
            Check Out
          </th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {attendances.map((attendance) => (
          <tr key={attendance.id}>
            <td className="px-6 py-4">
              {formatDate(
                attendance.attendanceDate,
              )}
            </td>

            <td className="px-6 py-4">
              {formatTime(
                attendance.checkInAt,
              )}
            </td>

            <td className="px-6 py-4">
              {formatTime(
                attendance.checkOutAt,
              )}
            </td>
          </tr>
        ))}

        {attendances.length === 0 && (
          <tr>
            <td
              colSpan={3}
              className="px-6 py-8 text-center text-gray-500"
            >
              No attendance records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      </div>
    </div>
  );
}

export default AttendancePage;