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

function isValidPhone(phone: string) {
  return /^\d{10,15}$/.test(phone);
}

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

    if (phone && !isValidPhone(phone)) {
      setError(
        'Phone must contain only digits and be between 10 and 15 digits',
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
    <div className="p-4 text-gray-600 md:p-8">
      Loading profile...
    </div>
  );
}

return (
  <div className="p-4 md:p-8">
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Edit Profile
        </h1>

        <p className="mt-2 text-sm text-gray-600 md:text-base">
          Update your photo and phone number.
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

        <div className="space-y-6">
          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />

            <p className="mt-2 text-xs text-gray-500 md:text-sm">
              Optional. 10-15 digits only.
            </p>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Profile Photo
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="mt-1 block w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-700 md:px-4"
            />

            <p className="mt-2 text-xs text-gray-500 md:text-sm">
              JPG, JPEG, PNG, or WEBP. Maximum 5 MB.
            </p>
          </div>

          {/* Photo Preview */}
          {displayedPhoto && (
            <div>
              <p className="mb-3 text-sm font-medium text-gray-700">
                Photo Preview
              </p>

              <div className="flex justify-center md:justify-start">
                <img
                  src={displayedPhoto}
                  alt="Profile preview"
                  className="h-28 w-28 rounded-full border border-gray-200 object-cover"
                />
              </div>
            </div>
          )}

          {/* Selected Photo */}
          {photoFile && (
            <div className="min-w-0 rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">
                New photo selected
              </p>

              <p className="mt-1 break-all text-sm text-blue-600">
                {photoFile.name}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
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