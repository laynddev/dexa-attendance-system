import { useEffect, useState } from 'react';

import {
  getAllAttendances,
  type Attendance,
} from '../services/attendance.service';

function AttendancePage() {
  const [attendances, setAttendances] = useState<
    Attendance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAttendances() {
      const token = localStorage.getItem(
        'admin_access_token',
      );

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
        const data = await getAllAttendances(token);
        setAttendances(data);
      } catch {
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    }

    loadAttendances();
  }, []);

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString('id-ID');
  }

  function formatDateTime(value: string | null) {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    });
  }

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading attendance data...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-2 text-gray-600">
          View employee attendance records.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4">
                Employee
              </th>

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
              <tr
                key={attendance.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {attendance.employee?.name ??
                      attendance.employeeId}
                  </div>

                  {attendance.employee && (
                    <div className="text-sm text-gray-500">
                      {
                        attendance.employee
                          .employeeNumber
                      }
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  {formatDate(
                    attendance.attendanceDate,
                  )}
                </td>

                <td className="px-6 py-4">
                  {formatDateTime(
                    attendance.checkInAt,
                  )}
                </td>

                <td className="px-6 py-4">
                  {attendance.checkOutAt ? (
                    formatDateTime(
                      attendance.checkOutAt,
                    )
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                      Not checked out
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {attendances.length === 0 &&
              !error && (
                <tr>
                  <td
                    colSpan={4}
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
  );
}

export default AttendancePage;