type LoginResponse = {
  accessToken: string;
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

export type AuthUser = {
  userId: string;
  email: string;
  roles: string[];
};

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