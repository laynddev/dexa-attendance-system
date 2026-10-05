import { useEffect, useState } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  getMyProfile,
  type EmployeeProfile,
} from '../services/employee.service';

import {
  getMe,
  type AuthUser,
} from '../services/auth.service';

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<EmployeeProfile | null>(null);

  const [authUser, setAuthUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem(
        'employee_access_token',
      );

      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
        const [profileData, authData] =
          await Promise.all([
            getMyProfile(token),
            getMe(token),
          ]);

        setProfile(profileData);
        setAuthUser(authData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    localStorage.removeItem(
      'employee_access_token',
    );

    navigate('/login');
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!profile || !authUser) {
    return (
      <div className="p-4 md:p-8 text-gray-600">
        Profile not found.
      </div>
    );
  }

  const initial =
    profile.name.trim().charAt(0).toUpperCase();

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-gray-600 md:text-base">
              View your employee information.
            </p>
          </div>

<div className="hidden gap-3 md:flex">
  <Link
    to="/profile/change-password"
    className="rounded-lg border border-blue-600 px-5 py-2 text-center font-medium text-blue-600 hover:bg-blue-50"
  >
    Change Password
  </Link>

  <Link
    to="/profile/edit"
    className="rounded-lg bg-blue-600 px-5 py-2 text-center font-medium text-white hover:bg-blue-700"
  >
    Edit Profile
  </Link>
</div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col items-center gap-4 border-b border-gray-200 pb-6 text-center md:flex-row md:gap-6 md:text-left">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                {initial}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                {profile.name}
              </h2>

              <p className="mt-1 text-gray-600">
                {profile.position}
              </p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  profile.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {profile.status}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Employee Number
              </p>

              <p className="mt-1 break-words font-medium text-gray-900">
                {profile.employeeNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Company Email
              </p>

              <p className="mt-1 break-words font-medium text-gray-900">
                {authUser.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Position
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.position}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Department
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.department ?? '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone Number
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.phone ?? '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {profile.status}
              </p>
            </div>
          </div>
        </div>

       {/* Mobile Actions */}
<div className="mt-6 space-y-3 md:hidden">
  <Link
    to="/profile/change-password"
    className="block w-full rounded-lg border border-blue-600 px-5 py-3 text-center font-medium text-blue-600 transition hover:bg-blue-50"
  >
    Change Password
  </Link>

  <Link
    to="/profile/edit"
    className="block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700"
  >
    Edit Profile
  </Link>

  <button
    type="button"
    onClick={handleLogout}
    className="w-full rounded-lg border border-red-200 bg-red-50 px-5 py-3 font-medium text-red-600 transition hover:bg-red-100"
  >
    Logout
  </button>
</div>
      </div>
    </div>
  );
}

export default ProfilePage;