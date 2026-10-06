import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  deleteEmployee,
  getEmployees,
  type Employee,
} from '../services/employee.service';

const PAGE_LIMIT = 10;

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deletingId, setDeletingId] = useState<
    string | null
    >(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('ACTIVE');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadEmployees() {
      const token = localStorage.getItem(
        'admin_access_token',
      );

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await getEmployees(
          token,
          page,
          PAGE_LIMIT,
          status,
          search,
        );

        setEmployees(response.data);
        setTotal(response.pagination.total);
        setTotalPages(
          response.pagination.totalPages,
        );
      } catch {
        setError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, [page, status, search]);

  function handlePreviousPage() {
    setPage((currentPage) =>
      Math.max(currentPage - 1, 1),
    );
  }

  function handleNextPage() {
    setPage((currentPage) =>
      Math.min(
        currentPage + 1,
        totalPages,
      ),
    );
  }

  function handlePageChange(
    targetPage: number,
  ) {
    setPage(targetPage);
  }

  async function handleDelete(employee: Employee) {
  const confirmed = window.confirm(
    `Are you sure you want to deactivate ${employee.name} (${employee.employeeNumber})?`,
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem(
    'admin_access_token',
  );

  if (!token) {
    setError('Authentication token not found');
    return;
  }

  try {
    setDeletingId(employee.id);
    setError('');

    await deleteEmployee(
      token,
      employee.id,
    );

    if (status === 'ALL') {
      setEmployees((currentEmployees) =>
        currentEmployees.map((item) =>
          item.id === employee.id
            ? {
                ...item,
                status: 'INACTIVE',
              }
            : item,
        ),
      );
    } else {
      setEmployees((currentEmployees) =>
        currentEmployees.filter(
          (item) => item.id !== employee.id,
        ),
      );

      setTotal((currentTotal) =>
        Math.max(currentTotal - 1, 0),
      );
    }
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Failed to delete employee');
    }
  } finally {
    setDeletingId(null);
  }
}

  const startItem =
    total === 0
      ? 0
      : (page - 1) * PAGE_LIMIT + 1;

  const endItem = Math.min(
    page * PAGE_LIMIT,
    total,
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Employee Management
            </h1>

            <p className="mt-2 text-gray-600">
              Manage employee information.
            </p>
          </div>

          <Link
            to="/employees/add"
            className="w-full rounded-lg bg-blue-600 px-5 py-2 text-center font-medium text-white hover:bg-blue-700 sm:w-auto"
          >
            + Add Employee
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or employee number..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ALL">All Status</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white shadow">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full text-left">
              <thead className="border-b bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-4">
                    Employee No.
                  </th>

                  <th className="px-6 py-4">
                    Email
                  </th>

                  <th className="px-6 py-4">
                    Name
                  </th>

                  <th className="px-6 py-4">
                    Position
                  </th>

                  <th className="px-6 py-4">
                    Department
                  </th>

                  <th className="px-6 py-4">
                    Phone
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : (
                  <>
                    {employees.map(
                      (employee) => (
                        <tr
                          key={employee.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium">
                            {
                              employee.employeeNumber
                            }
                          </td>

                          <td className="px-6 py-4">
                            {employee.email}
                          </td>

                          <td className="px-6 py-4">
                            {employee.name}
                          </td>

                          <td className="px-6 py-4">
                            {employee.position}
                          </td>

                          <td className="px-6 py-4">
                            {employee.department ??
                              '-'}
                          </td>

                          <td className="px-6 py-4">
                            {employee.phone ?? '-'}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                employee.status ===
                                'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {employee.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <Link
                                to={`/employees/${employee.id}/edit`}
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </Link>

                              {employee.status === 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(employee)
                                  }
                                  disabled={
                                    deletingId === employee.id
                                  }
                                  className="font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId === employee.id
                                    ? 'Deleting...'
                                    : 'Delete'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {employees.length === 0 &&
                      !error && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No employees found.
                          </td>
                        </tr>
                      )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {!loading && !error && total > 0 && (
            <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <p className="text-sm text-gray-600">
                Showing {startItem} - {endItem}{' '}
                of {total} employees
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) => {
                    const pageNumber =
                      index + 1;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() =>
                          handlePageChange(
                            pageNumber,
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  },
                )}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={
                    page === totalPages
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeesPage;