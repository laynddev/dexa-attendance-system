import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '../services/auth.service';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      localStorage.setItem(
        'employee_access_token',
        result.accessToken,
      );

      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

return (
  <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Employee Login
        </h1>

        <p className="mt-2 text-sm text-gray-600 md:text-base">
          WFH Attendance System
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-gray-700">
            Company Email
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="employee@company.com"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? 'Signing in...'
            : 'Sign In'}
        </button>
      </form>
    </div>
  </div>
);
}

export default LoginPage;