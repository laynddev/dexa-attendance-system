export type LoginResponse = {
  accessToken: string;
};

export type AuthUser = {
  userId: string;
  email: string;
  roles: string[];
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(
    'http://localhost:3001/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return response.json();
}

export async function getMe(
  token: string,
): Promise<AuthUser> {
  const response = await fetch(
    'http://localhost:3001/auth/me',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unauthorized');
  }

  return response.json();
}

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  token: string,
  data: ChangePasswordData,
): Promise<void> {
  const response = await fetch(
    'http://localhost:3001/auth/change-password',
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

    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message;

    throw new Error(
      message ?? 'Failed to change password',
    );
  }
}