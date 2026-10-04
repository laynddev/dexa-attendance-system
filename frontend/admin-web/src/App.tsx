import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type ProfileNotification = {
  employeeId: string;
  userId: string;
  name: string;
  updatedFields: Record<string, unknown>;
};

function App() {
  const [notification, setNotification] =
    useState<ProfileNotification | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3002');

    socket.on('connect', () => {
      console.log('Admin connected to notification WebSocket');
    });

    socket.on(
      'employee-profile-updated',
      (data: ProfileNotification) => {
        console.log('Notification received:', data);
        setNotification(data);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Admin Dashboard
      </h1>

      {notification && (
        <div className="mt-6 rounded-lg border p-4 shadow">
          <h2 className="font-bold">
            Employee Profile Updated
          </h2>

          <p className="mt-2">
            {notification.name} updated their profile.
          </p>

          <pre className="mt-2">
            {JSON.stringify(
              notification.updatedFields,
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;