import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import EmployeeLayout from './components/EmployeeLayout';
import InactiveRoute from './components/InactiveRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AttendancePage from './pages/AttendancePage';
import InactiveEmployeePage from './pages/InactiveEmployeePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/inactive"
          element={
            <InactiveRoute>
              <InactiveEmployeePage />
            </InactiveRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EmployeeLayout>
                <DashboardPage />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <EmployeeLayout>
                <ProfilePage />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EmployeeLayout>
                <EditProfilePage />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <EmployeeLayout>
                <ChangePasswordPage />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <EmployeeLayout>
                <AttendancePage />
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;