export type EmployeeProfile = {
  id: string;
  userId: string;
  employeeNumber: string;
  name: string;
  photoUrl: string | null;
  position: string;
  department: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export async function getMyProfile(
  token: string,
): Promise<EmployeeProfile> {
  const response = await fetch(
    'http://localhost:3002/employees/me',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to load employee profile');
  }

  return response.json();
}


export type UpdateMyProfileData = {
  photoUrl?: string;
  phone?: string;
};

export async function updateMyProfile(
  token: string,
  data: UpdateMyProfileData,
): Promise<EmployeeProfile> {
  const response = await fetch(
    'http://localhost:3002/employees/me',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ?? 'Failed to update profile',
    );
  }

  return response.json();
}


export async function uploadMyPhoto(
  token: string,
  photo: File,
): Promise<EmployeeProfile> {
  const formData = new FormData();

  formData.append('photo', photo);

  const response = await fetch(
    'http://localhost:3002/employees/me/photo',
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message;

    throw new Error(
      message ?? 'Failed to upload profile photo',
    );
  }

  return response.json();
}