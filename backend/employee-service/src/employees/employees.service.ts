import { Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly rabbitMQ: AmqpConnection,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
    authorization: string,
    actorUserId: string,
  ) {
    try {
      // 1. Create user through Auth Service
      const response = await firstValueFrom(
        this.httpService.post(
            'http://localhost:3001/auth/users',
            {
                email: createEmployeeDto.email,
                password: createEmployeeDto.password,
            },
            {
                headers: {
                Authorization: authorization,
                },
            },
            ),
      );

      const userId = response.data.id;

      const employee = await this.prisma.employee.create({
        data: {
          userId,
          employeeNumber: createEmployeeDto.employeeNumber,
          name: createEmployeeDto.name,
          photoUrl: createEmployeeDto.photoUrl,
          position: createEmployeeDto.position,
          department: createEmployeeDto.department,
          phone: createEmployeeDto.phone,
        },
      });

      await this.rabbitMQ.publish(
        'attendance.events',
        'employee.created',
        {
          eventType: 'EMPLOYEE_CREATED',
          service: 'employee-service',
          actorUserId,
          entityType: 'EMPLOYEE',
          entityId: employee.id,
          payload: {
            targetUserId: employee.userId,
            employeeNumber: employee.employeeNumber,
            name: employee.name,
            position: employee.position,
            department: employee.department,
          },
        },
      );

      return employee;
    } catch (error) {
      console.error('Failed to create employee:', error);

      throw new InternalServerErrorException(
        'Failed to create employee',
      );
    }
  }

  async findAll() {
    return this.prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
  id: string,
  updateEmployeeDto: UpdateEmployeeDto,
  actorUserId: string,
) {
  const employee = await this.prisma.employee.update({
    where: { id },
    data: updateEmployeeDto,
  });

  await this.rabbitMQ.publish(
    'attendance.events',
    'employee.updated',
    {
      eventType: 'EMPLOYEE_UPDATED',
      service: 'employee-service',
      actorUserId,
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      payload: {
        targetUserId: employee.userId,
        updatedFields: updateEmployeeDto,
      },
    },
  );

  return employee;
}

  async findByUserId(userId: string) {
  return this.prisma.employee.findUnique({
    where: {
      userId,
    },
  });
}

async updateMyProfile(
  userId: string,
  updateMyProfileDto: UpdateMyProfileDto,
) {
  const employee = await this.prisma.employee.findUnique({
    where: {
      userId,
    },
  });

  if (!employee) {
    throw new NotFoundException('Employee profile not found');
  }

  const updatedEmployee = await this.prisma.employee.update({
    where: {
      id: employee.id,
    },
    data: updateMyProfileDto,
  });

  await this.rabbitMQ.publish(
    'attendance.events',
    'employee.profile.updated',
    {
      eventType: 'EMPLOYEE_PROFILE_UPDATED',
      service: 'employee-service',
      actorUserId: userId,
      entityType: 'EMPLOYEE',
      entityId: updatedEmployee.id,
      payload: {
        targetUserId: updatedEmployee.userId,
        updatedFields: updateMyProfileDto,
      },
    },
  );

  

  this.notificationGateway.sendEmployeeProfileUpdated({
    employeeId: updatedEmployee.id,
    userId: updatedEmployee.userId,
    name: updatedEmployee.name,
    updatedFields: updateMyProfileDto,
  });

  return updatedEmployee;
}

}