import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { changePassword } from '../services/auth.service';

function isValidPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
    password,
  );
}

function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError(
        'New password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number',
      );
      return;
    }

    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      setError('Authentication token not found');
      return;
    }

    setSaving(true);

    try {
      await changePassword(token, {
        currentPassword,
        newPassword,
      });

      navigate('/profile');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none';

  return (
  <div className="p-4 md:p-8">
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Change Password
        </h1>

        <p className="mt-2 text-sm text-gray-600 md:text-base">
          Update your account password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-4 shadow md:p-6"
      >
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 md:text-base">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Current Password
            </label>

            <input
              type="password"
              required
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              className={inputClass}
            />

            <p className="mt-2 text-xs text-gray-500">
              Minimum 8 characters with uppercase,
              lowercase, and number.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate('/profile')
            }
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
          >
            {saving
              ? 'Changing...'
              : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

export default ChangePasswordPage;