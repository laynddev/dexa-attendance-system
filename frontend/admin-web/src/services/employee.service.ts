export type Employee = {
  id: string;
  userId: string;
  employeeNumber: string;
  email: string | null;
  name: string;
  photoUrl?: string | null;
  position: string;
  department?: string | null;
  phone?: string | null;
  status: string;
};

export type EmployeePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EmployeesResponse = {
  data: Employee[];
  pagination: EmployeePagination;
};

export async function getEmployees(
  token: string,
  page = 1,
  limit = 10,
  status = 'ACTIVE',
  search = '',
): Promise<EmployeesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
    search,
  });

  const response = await fetch(
    `http://localhost:3002/employees?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to load employees');
  }

  return response.json();
}

export type CreateEmployeeData = {
  email: string;
  password: string;
  name: string;
  position: string;
  department?: string;
  phone?: string;
  photoUrl?: string;
};

export async function createEmployee(
  token: string,
  data: CreateEmployeeData,
): Promise<Employee> {
  const response = await fetch(
    'http://localhost:3002/employees',
    {
      method: 'POST',
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
      error?.message ?? 'Failed to create employee',
    );
  }

  return response.json();
}

export type UpdateEmployeeData = {
  email: string;
  name?: string;
  position?: string;
  department?: string;
  phone?: string;
  photoUrl?: string;
  status?: string;
};

export async function getEmployeeById(
  token: string,
  id: string,
): Promise<Employee> {
  const response = await fetch(
    `http://localhost:3002/employees/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to load employee');
  }

  return response.json();
}

export async function updateEmployee(
  token: string,
  id: string,
  data: UpdateEmployeeData,
): Promise<Employee> {
  const response = await fetch(
    `http://localhost:3002/employees/${id}`,
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
      error?.message ?? 'Failed to update employee',
    );
  }

  return response.json();
}

export async function deleteEmployee(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(
    `http://localhost:3002/employees/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.message ?? 'Failed to delete employee',
    );
  }
}