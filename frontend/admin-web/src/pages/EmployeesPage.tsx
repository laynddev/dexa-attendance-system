import { useEffect, useState } from 'react';

import {
  getEmployees,
  type Employee,
} from '../services/employee.service';

import { Link } from 'react-router-dom';

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const data = await getEmployees(token);
        setEmployees(data);
      } catch {
        setError('Failed to load employees');
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading employees...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                Employee Management
                </h1>

                <p className="mt-2 text-gray-600">
                Manage employee information.
                </p>
            </div>

            <Link
                to="/employees/add"
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
                + Add Employee
            </Link>
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
                  Employee No.
                </th>
                <th className="px-6 py-4">Name</th>
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
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium">
                    {employee.employeeNumber}
                  </td>

                  <td className="px-6 py-4">
                    {employee.name}
                  </td>

                  <td className="px-6 py-4">
                    {employee.position}
                  </td>

                  <td className="px-6 py-4">
                    {employee.department ?? '-'}
                  </td>

                  <td className="px-6 py-4">
                    {employee.phone ?? '-'}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {employee.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                        to={`/employees/${employee.id}/edit`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </Link>
                    </td>
                </tr>
              ))}

              {employees.length === 0 && !error && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No employees found.
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

export default EmployeesPage;