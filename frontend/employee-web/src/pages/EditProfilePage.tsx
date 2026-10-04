import { useEffect, useState } from 'react';
import type {
  ChangeEvent,
  FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
} from '../services/employee.service';

function EditProfilePage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');

  const [currentPhotoUrl, setCurrentPhotoUrl] =
    useState('');

  const [photoFile, setPhotoFile] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const profile = await getMyProfile(token);

        setPhone(profile.phone ?? '');
        setCurrentPhotoUrl(profile.photoUrl ?? '');
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

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Only JPG, JPEG, PNG, and WEBP files are allowed',
      );

      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        'Profile photo must not be larger than 5 MB',
      );

      event.target.value = '';
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoFile(file);
    setPhotoPreview(previewUrl);
    setError('');
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = localStorage.getItem(
      'employee_access_token',
    );

    if (!token) {
      setError('Authentication token not found');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateMyProfile(token, {
        phone,
      });

      if (photoFile) {
        await uploadMyPhoto(
          token,
          photoFile,
        );
      }

      navigate('/profile');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  }

  const displayedPhoto =
    photoPreview || currentPhotoUrl;

  if (loading) {
    return (
      <div className="p-8 text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Update your photo and phone number.
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

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Profile Photo
              </label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700"
              />

              <p className="mt-2 text-sm text-gray-500">
                JPG, JPEG, PNG, or WEBP. Maximum 5 MB.
              </p>
            </div>

            {displayedPhoto && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Photo Preview
                </p>

                <img
                  src={displayedPhoto}
                  alt="Profile preview"
                  className="h-28 w-28 rounded-full border border-gray-200 object-cover"
                />
              </div>
            )}

            {photoFile && (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">
                  New photo selected
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  {photoFile.name}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                navigate('/profile')
              }
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

export default EditProfilePage;