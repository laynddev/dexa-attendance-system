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
      <div className="p-8 text-gray-600">
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance
          </h1>

          <p className="mt-2 text-gray-600">
            Check in, check out, and view your
            attendance history.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Attendance
          </h2>

          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">
                Date
              </p>

              <p className="mt-1 font-medium">
                {new Date().toLocaleDateString(
                  'id-ID',
                  {
                    timeZone: 'Asia/Jakarta',
                  },
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Check In
              </p>

              <p className="mt-1 font-medium">
                {formatTime(
                  todayAttendance?.checkInAt ??
                    null,
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Check Out
              </p>

              <p className="mt-1 font-medium">
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
                className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? 'Processing...'
                    : 'Check Out'}
                </button>
              )}

            {todayAttendance?.checkOutAt && (
              <span className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                Attendance Completed
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            Attendance Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a date range to view your
            attendance history.
          </p>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
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
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex-1">
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
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleFilter}
              disabled={filtering}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {filtering
                ? 'Loading...'
                : 'Filter'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {startDate} - {endDate}
            </p>
          </div>

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
              {attendances.map(
                (attendance) => (
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
                ),
              )}

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
  );
}

export default AttendancePage;