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

export async function getAllAttendances(
  token: string,
): Promise<Attendance[]> {
  const response = await fetch(
    'http://localhost:3003/attendance/admin',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to load attendance data');
  }

  return response.json();
}