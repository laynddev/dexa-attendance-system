import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoggingService {
  constructor(private readonly prisma: PrismaService) {}

  @RabbitSubscribe({
    exchange: 'attendance.events',
    routingKey: '#',
    queue: 'attendance.logging',
    queueOptions: {
      durable: true,
    },
  })
  async handleEvent(event: {
    eventType: string;
    service: string;
    actorUserId?: string;
    entityType?: string;
    entityId?: string;
    payload?: Record<string, any>;
  }) {
    console.log('Received event:', event);

    await this.prisma.auditLog.create({
      data: {
        eventType: event.eventType,
        service: event.service,
        actorUserId: event.actorUserId,
        entityType: event.entityType,
        entityId: event.entityId,
        payload: event.payload,
      },
    });
  }
}
