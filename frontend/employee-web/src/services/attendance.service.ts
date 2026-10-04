export type Attendance = {
  id: string;
  employeeId: string;
  attendanceDate: string;
  checkInAt: string;
  checkOutAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function checkIn(
  token: string,
): Promise<Attendance> {
  const response = await fetch(
    'http://localhost:3003/attendance/check-in',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message;

    throw new Error(
      message ?? 'Failed to check in',
    );
  }

  return response.json();
}

export async function checkOut(
  token: string,
): Promise<Attendance> {
  const response = await fetch(
    'http://localhost:3003/attendance/check-out',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message;

    throw new Error(
      message ?? 'Failed to check out',
    );
  }

  return response.json();
}

export async function getAttendanceSummary(
  token: string,
  startDate?: string,
  endDate?: string,
): Promise<Attendance[]> {
  const params = new URLSearchParams();

  if (startDate) {
    params.set('startDate', startDate);
  }

  if (endDate) {
    params.set('endDate', endDate);
  }

  const query = params.toString();

  const response = await fetch(
    `http://localhost:3003/attendance/summary${
      query ? `?${query}` : ''
    }`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message;

    throw new Error(
      message ?? 'Failed to load attendance summary',
    );
  }

  return response.json();
}