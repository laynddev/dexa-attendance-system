import { useNavigate } from 'react-router-dom';

function InactiveEmployeePage() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem(
      'employee_access_token',
    );

    navigate('/login', {
      replace: true,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl font-bold text-red-600">
            !
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Employee Inactive
        </h1>

        <p className="mt-3 text-gray-600">
          Your employee account is currently inactive.
          You cannot access employee features.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please contact the administrator for more
          information.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default InactiveEmployeePage;