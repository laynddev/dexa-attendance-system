import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendEmployeeProfileUpdated(data: {
    employeeId: string;
    userId: string;
    name: string;
    updatedFields: Record<string, any>;
  }) {
    this.server.emit('employee-profile-updated', data);
  }
}
