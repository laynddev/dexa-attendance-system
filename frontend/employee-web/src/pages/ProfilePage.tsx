import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getMyProfile,
  type EmployeeProfile,
} from '../services/employee.service';

import {
  getMe,
  type AuthUser,
} from '../services/auth.service';

function ProfilePage() {
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

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!profile || !authUser) {
    return (
      <div className="p-8 text-gray-600">
        Profile not found.
      </div>
    );
  }

  const initial =
    profile.name.trim().charAt(0).toUpperCase();

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Profile
            </h1>

            <p className="mt-2 text-gray-600">
              View your employee information.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/profile/change-password"
              className="rounded-lg border border-blue-600 px-5 py-2 font-medium text-blue-600 hover:bg-blue-50"
            >
              Change Password
            </Link>

            <Link
              to="/profile/edit"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 md:flex-row md:items-center">
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
              <h2 className="text-2xl font-bold text-gray-900">
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

              <p className="mt-1 font-medium text-gray-900">
                {profile.employeeNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Company Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
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
      </div>
    </div>
  );
}

export default ProfilePage;