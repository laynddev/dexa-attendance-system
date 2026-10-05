import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { createEmployee } from '../services/employee.service';

function isValidPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
    password,
  );
}

function isValidPhone(phone: string) {
  return /^\d{10,15}$/.test(phone);
}

function AddEmployeePage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!isValidPassword(password)) {
      setError(
        'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number',
      );
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setError(
        'Phone must contain only digits and be between 10 and 15 digits',
      );
      return;
    }

    const token = localStorage.getItem(
      'admin_access_token',
    );

    if (!token) {
      setError('Authentication token not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createEmployee(token, {
        email,
        password,
        name,
        position,
        department: department || undefined,
        phone: phone || undefined,
      });

      navigate('/employees');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create employee');
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none';

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Add Employee
          </h1>

          <p className="mt-2 text-gray-600">
            Create a new employee account and profile.
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
                Company Email *
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Initial Password *
              </label>

              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters with uppercase,
                lowercase, and number.
              </p>
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
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Creating...'
                : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployeePage;