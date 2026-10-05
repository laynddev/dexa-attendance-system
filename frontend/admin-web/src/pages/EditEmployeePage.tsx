import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getEmployeeById,
  updateEmployee,
} from '../services/employee.service';

function isValidPhone(phone: string) {
  return /^\d{10,15}$/.test(phone);
}

function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employeeNumber, setEmployeeNumber] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEmployee() {
      const token = localStorage.getItem(
        'admin_access_token',
      );

      if (!token || !id) {
        setError('Employee cannot be loaded');
        setLoading(false);
        return;
      }

      try {
        const employee = await getEmployeeById(
          token,
          id,
        );

        setEmployeeNumber(employee.employeeNumber);
        setName(employee.name);
        setPosition(employee.position);
        setDepartment(employee.department ?? '');
        setPhone(employee.phone ?? '');
        setStatus(employee.status);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load employee');
        }
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (phone && !isValidPhone(phone)) {
      setError(
        'Phone must contain only digits and be between 10 and 15 digits',
      );
      return;
    }

    const token = localStorage.getItem(
      'admin_access_token',
    );

    if (!token || !id) {
      setError('Employee cannot be updated');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateEmployee(token, id, {
        name,
        position,
        department,
        phone,
        status,
      });

      navigate('/employees');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update employee');
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none';

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading employee...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Employee
          </h1>

          <p className="mt-2 text-gray-600">
            Update employee information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow"
        >
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Employee Number *
              </label>

              <input
                type="text"
                value={employeeNumber}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500`}
              />

            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Name *
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Position *
              </label>

              <input
                type="text"
                required
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>

              <input
                type="text"
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="tel"
                inputMode="numeric"
                minLength={10}
                maxLength={15}
                pattern="[0-9]{10,15}"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                className={inputClass}
              />

              <p className="mt-1 text-xs text-gray-500">
                Optional. 10-15 digits only.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Status *
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className={inputClass}
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>
                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeePage;