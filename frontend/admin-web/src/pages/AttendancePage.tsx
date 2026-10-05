import {
  useEffect,
  useRef,
  useState,
} from 'react';
import type { FormEvent } from 'react';

import {
  getAllAttendances,
  type Attendance,
} from '../services/attendance.service';

import {
  getEmployees,
  type Employee,
} from '../services/employee.service';

function getTodayInWIB() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getFirstDayOfCurrentMonthInWIB() {
  const today = getTodayInWIB();

  return `${today.slice(0, 7)}-01`;
}

const PAGE_LIMIT = 10;

function AttendancePage() {
  const [attendances, setAttendances] = useState<
    Attendance[]
  >([]);

  const [employees, setEmployees] = useState<
    Employee[]
  >([]);

  const [startDate, setStartDate] = useState(
    getFirstDayOfCurrentMonthInWIB(),
  );

  const [endDate, setEndDate] = useState(
    getTodayInWIB(),
  );

  const [employeeId, setEmployeeId] =
    useState('');

  const [employeeSearch, setEmployeeSearch] =
    useState('');

  const [
    employeeDropdownOpen,
    setEmployeeDropdownOpen,
  ] = useState(false);

  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] =
    useState(false);
  const [error, setError] = useState('');
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const [totalPages, setTotalPages] =
  useState(0);

  const employeeDropdownRef =
    useRef<HTMLDivElement>(null);

  async function loadAttendances(
  selectedStartDate: string,
  selectedEndDate: string,
  selectedEmployeeId: string,
  selectedPage: number,
) {
  const token = localStorage.getItem(
    'admin_access_token',
  );

  if (!token) {
    throw new Error(
      'Authentication token not found',
    );
  }

  return getAllAttendances(
    token,
    selectedStartDate,
    selectedEndDate,
    selectedEmployeeId || undefined,
    selectedPage,
    PAGE_LIMIT,
  );
}

useEffect(() => {
  async function loadPage() {
    const token = localStorage.getItem(
      'admin_access_token',
    );

    if (!token) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      const [
        employeeData,
        attendanceResponse,
      ] = await Promise.all([
        getEmployees(token, 1, 100),

        getAllAttendances(
          token,
          getFirstDayOfCurrentMonthInWIB(),
          getTodayInWIB(),
          undefined,
          1,
          PAGE_LIMIT,
        ),
      ]);

      setEmployees(employeeData.data);

      setAttendances(
        attendanceResponse.data,
      );

      setPage(
        attendanceResponse.pagination.page,
      );

      setTotal(
        attendanceResponse.pagination.total,
      );

      setTotalPages(
        attendanceResponse.pagination
          .totalPages,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Failed to load attendance data',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  loadPage();
}, []);

useEffect(() => {
  function handleClickOutside(
    event: MouseEvent,
  ) {
    if (
      employeeDropdownRef.current &&
      !employeeDropdownRef.current.contains(
        event.target as Node,
      )
    ) {
      setEmployeeDropdownOpen(false);
    }
  }

  document.addEventListener(
    'mousedown',
    handleClickOutside,
  );

  return () => {
    document.removeEventListener(
      'mousedown',
      handleClickOutside,
    );
  };
}, []);
  const filteredEmployees = employees.filter(
    (employee) => {
      const keyword = employeeSearch
        .trim()
        .toLowerCase();

      if (!keyword) {
        return true;
      }

      return (
        employee.name
          .toLowerCase()
          .includes(keyword) ||
        employee.employeeNumber
          .toLowerCase()
          .includes(keyword)
      );
    },
  );

  const selectedEmployee = employees.find(
    (employee) => employee.id === employeeId,
  );

  function selectEmployee(employee: Employee) {
    setEmployeeId(employee.id);

    setEmployeeSearch(
      `${employee.employeeNumber} - ${employee.name}`,
    );

    setEmployeeDropdownOpen(false);
  }

  function selectAllEmployees() {
    setEmployeeId('');
    setEmployeeSearch('');
    setEmployeeDropdownOpen(false);
  }

  function handleEmployeeSearchChange(
    value: string,
  ) {
    setEmployeeSearch(value);
    setEmployeeId('');
    setEmployeeDropdownOpen(true);
  }
async function handleFilter(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (!startDate || !endDate) {
    setError(
      'Start date and end date are required',
    );
    return;
  }

  if (startDate > endDate) {
    setError(
      'Start date cannot be after end date',
    );
    return;
  }

  setFiltering(true);
  setError('');

  try {
    const response = await loadAttendances(
      startDate,
      endDate,
      employeeId,
      1,
    );

    setAttendances(response.data);

    setPage(response.pagination.page);

    setTotal(response.pagination.total);

    setTotalPages(
      response.pagination.totalPages,
    );
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(
        'Failed to filter attendance data',
      );
    }
  } finally {
    setFiltering(false);
  }
}

async function handlePageChange(
  targetPage: number,
) {
  if (
    targetPage < 1 ||
    targetPage > totalPages ||
    targetPage === page
  ) {
    return;
  }

  try {
    setFiltering(true);
    setError('');

    const response = await loadAttendances(
      startDate,
      endDate,
      employeeId,
      targetPage,
    );

    setAttendances(response.data);

    setPage(response.pagination.page);

    setTotal(response.pagination.total);

    setTotalPages(
      response.pagination.totalPages,
    );
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError(
        'Failed to load attendance data',
      );
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

  function formatDateTime(
    value: string | null,
  ) {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
      },
    );
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

      <form
        onSubmit={handleFilter}
        className="mb-6 rounded-xl bg-white p-6 shadow"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="date"
              required
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              required
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div
            ref={employeeDropdownRef}
            className="relative"
          >
            <label className="text-sm font-medium text-gray-700">
              Employee
            </label>

            <input
              type="text"
              value={employeeSearch}
              placeholder="All Employees"
              autoComplete="off"
              onFocus={() =>
                setEmployeeDropdownOpen(true)
              }
              onChange={(event) =>
                handleEmployeeSearchChange(
                  event.target.value,
                )
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none"
            />

            {employeeSearch && (
              <button
                type="button"
                onClick={selectAllEmployees}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-700"
                title="Clear employee"
              >
                ×
              </button>
            )}

            {employeeDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={selectAllEmployees}
                  className={`block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                    employeeId === ''
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  All Employees
                </button>

                {filteredEmployees.map(
                  (employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() =>
                        selectEmployee(employee)
                      }
                      className={`block w-full border-t border-gray-100 px-4 py-3 text-left hover:bg-gray-50 ${
                        employee.id === employeeId
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {employee.employeeNumber}
                        {' · '}
                        {employee.position}
                      </div>
                    </button>
                  ),
                )}

                {filteredEmployees.length ===
                  0 && (
                  <div className="px-4 py-4 text-sm text-gray-500">
                    No employees found.
                  </div>
                )}
              </div>
            )}

            {selectedEmployee && (
              <p className="mt-1 text-xs text-gray-500">
                Selected:{' '}
                {selectedEmployee.employeeNumber} -{' '}
                {selectedEmployee.name}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={filtering}
              className="w-full rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {filtering
                ? 'Filtering...'
                : 'Filter'}
            </button>
          </div>
        </div>
      </form>

<div className="mb-4 text-sm text-gray-600">
  {total === 0 ? (
    <>Showing 0 attendance records</>
  ) : (
    <>
      Showing{' '}
      {(page - 1) * PAGE_LIMIT + 1} -{' '}
      {Math.min(
        page * PAGE_LIMIT,
        total,
      )}{' '}
      of {total} attendance records
    </>
  )}
</div>

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
                    No attendance records found
                    for the selected filters.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      {!error && total > 0 && (
  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-gray-600">
      Page {page} of {totalPages}
    </p>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={
          page === 1 || filtering
        }
        onClick={() =>
          handlePageChange(page - 1)
        }
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {Array.from(
        {
          length: totalPages,
        },
        (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              type="button"
              disabled={filtering}
              onClick={() =>
                handlePageChange(
                  pageNumber,
                )
              }
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                page === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {pageNumber}
            </button>
          );
        },
      )}

      <button
        type="button"
        disabled={
          page === totalPages ||
          filtering
        }
        onClick={() =>
          handlePageChange(page + 1)
        }
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default AttendancePage;