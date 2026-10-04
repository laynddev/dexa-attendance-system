import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

type Notification = {
  employeeId: string;
  userId: string;
  name: string;
  updatedFields: Record<string, unknown>;
};

function NotificationListener() {
  const [notification, setNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:3002');

    socket.on(
      'employee-profile-updated',
      (data: Notification) => {
        setNotification(data);

        setTimeout(() => {
          setNotification(null);
        }, 5000);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!notification) {
    return null;
  }

  return (
    <div className="fixed right-6 top-6 z-50 w-96 rounded-xl border border-blue-200 bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            Employee Profile Updated
          </h3>

          <p className="mt-1 text-sm text-gray-600">
            {notification.name} updated their profile.
          </p>

        </div>

        <button
          type="button"
          onClick={() => setNotification(null)}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default NotificationListener;