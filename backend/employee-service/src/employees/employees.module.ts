import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    ConfigModule,
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
  controllers: [EmployeesController],
  providers: [EmployeesService, JwtStrategy, NotificationGateway],
})
export class EmployeesModule {}
