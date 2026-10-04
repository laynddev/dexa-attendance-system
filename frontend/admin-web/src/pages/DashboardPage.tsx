function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          WFH Attendance Management System
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Employees
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              -
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Checked In Today
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              -
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Checked Out Today
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              -
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;