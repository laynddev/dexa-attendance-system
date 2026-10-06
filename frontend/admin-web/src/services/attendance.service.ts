export type Attendance = {
  id: string;
  employeeId: string;
  attendanceDate: string;
  checkInAt: string;
  checkOutAt: string | null;

  employee?: {
    id: string;
    employeeNumber: string;
    name: string;
  };
};

export type AttendancePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AttendancesResponse = {
  data: Attendance[];
  pagination: AttendancePagination;
};

export type AttendanceStats = {
  checkedIn: number;
  checkedOut: number;
};

export async function getAllAttendances(
  token: string,
  startDate?: string,
  endDate?: string,
  employeeId?: string,
  page = 1,
  limit = 10,
): Promise<AttendancesResponse> {
  const params = new URLSearchParams();

  if (startDate) {
    params.set('startDate', startDate);
  }

  if (endDate) {
    params.set('endDate', endDate);
  }

  if (employeeId) {
    params.set('employeeId', employeeId);
  }

  params.set('page', String(page));
  params.set('limit', String(limit));

  const query = params.toString();

  const response = await fetch(
    `http://localhost:3003/attendance/admin?${query}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    const message = Array.isArray(
      error?.message,
    )
      ? error.message.join(', ')
      : error?.message;

    throw new Error(
      message ??
        'Failed to load attendance data',
    );
  }

  return response.json();
}

export async function getAttendanceStats(
  token: string,
  date?: string,
): Promise<AttendanceStats> {
  const params = new URLSearchParams();

  if (date) {
    params.set('date', date);
  }

  const query = params.toString();

  const response = await fetch(
    `http://localhost:3003/attendance/admin/stats${
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
    throw new Error(
      'Failed to load attendance statistics',
    );
  }

  return response.json();
}