import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,

    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'attendance.events',
          type: 'topic',
        },
      ],
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: {
        wait: true,
      },
    }),
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    JwtStrategy,
    RolesGuard,
  ],
})
export class AttendanceModule {}