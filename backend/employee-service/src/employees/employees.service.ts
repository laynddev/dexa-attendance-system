import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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
      const lastEmployee = await this.prisma.employee.findFirst({
        where: {
          employeeNumber: {
            startsWith: 'EMP',
          },
        },
        orderBy: {
          employeeNumber: 'desc',
        },
        select: {
          employeeNumber: true,
        },
      });

      let nextNumber = 1;

      if (lastEmployee) {
        const currentNumber = Number(
          lastEmployee.employeeNumber.replace('EMP', ''),
        );

        if (!Number.isNaN(currentNumber)) {
          nextNumber = currentNumber + 1;
        }
      }

      const employeeNumber = `EMP${String(nextNumber).padStart(4, '0')}`;

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
          employeeNumber,
          name: createEmployeeDto.name,
          photoUrl: createEmployeeDto.photoUrl,
          position: createEmployeeDto.position,
          department: createEmployeeDto.department,
          phone: createEmployeeDto.phone,
        },
      });

      await this.rabbitMQ.publish('attendance.events', 'employee.created', {
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
      });

      return employee;
    } catch (error) {
      console.error('Failed to create employee:', error);

      throw new InternalServerErrorException('Failed to create employee');
    }
  }
  async findAll(page = 1, limit = 10, status = 'ACTIVE', search = '') {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;

    const safeLimit =
      Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10;

    const skip = (safePage - 1) * safeLimit;

    const normalizedStatus = status.toUpperCase();
    const normalizedSearch = search.trim();

    const where = {
      ...(normalizedStatus !== 'ALL' && {
        status: normalizedStatus,
      }),

      ...(normalizedSearch && {
        OR: [
          {
            name: {
              contains: normalizedSearch,
              mode: 'insensitive' as const,
            },
          },
          {
            employeeNumber: {
              contains: normalizedSearch,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          employeeNumber: 'asc',
        },
      }),

      this.prisma.employee.count({
        where,
      }),
    ]);

    const userIds = employees.map((employee) => employee.userId);

    const users = await this.prisma.users.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const emailByUserId = new Map(users.map((user) => [user.id, user.email]));

    const data = employees.map((employee) => ({
      ...employee,
      email: emailByUserId.get(employee.userId) ?? null,
    }));

    const totalPages = Math.ceil(total / safeLimit);

    return {
      data,

      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  }
  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const user = await this.prisma.users.findUnique({
      where: {
        id: employee.userId,
      },
      select: {
        email: true,
      },
    });

    return {
      ...employee,
      email: user?.email ?? null,
    };
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    actorUserId: string,
  ) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    const currentUser = await this.prisma.users.findUnique({
      where: {
        id: existingEmployee.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const { email, ...employeeData } = updateEmployeeDto;

    const isEmailChanged = email !== currentUser.email;

    if (isEmailChanged) {
      const existingUser = await this.prisma.users.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    let employee;

    if (isEmailChanged) {
      [employee] = await this.prisma.$transaction([
        this.prisma.employee.update({
          where: {
            id,
          },
          data: employeeData,
        }),

        this.prisma.users.update({
          where: {
            id: existingEmployee.userId,
          },
          data: {
            email,
          },
        }),
      ]);
    } else {
      employee = await this.prisma.employee.update({
        where: {
          id,
        },
        data: employeeData,
      });
    }

    await this.rabbitMQ.publish('attendance.events', 'employee.updated', {
      eventType: 'EMPLOYEE_UPDATED',
      service: 'employee-service',
      actorUserId,
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      payload: {
        targetUserId: employee.userId,
        updatedFields: updateEmployeeDto,
      },
    });

    return {
      ...employee,
      email,
    };
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

  async updateMyPhoto(userId: string, filename: string) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        userId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const photoUrl = `http://localhost:3002/uploads/profile/${filename}`;

    const updatedEmployee = await this.prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        photoUrl,
      },
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
          updatedFields: {
            photoUrl,
          },
        },
      },
    );

    this.notificationGateway.sendEmployeeProfileUpdated({
      employeeId: updatedEmployee.id,
      userId: updatedEmployee.userId,
      name: updatedEmployee.name,
      updatedFields: {
        photoUrl,
      },
    });

    return updatedEmployee;
  }

  async remove(id: string, actorUserId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status === 'INACTIVE') {
      return {
        message: 'Employee is already inactive',
        employee,
      };
    }

    const [updatedEmployee] = await this.prisma.$transaction([
      this.prisma.employee.update({
        where: {
          id: employee.id,
        },
        data: {
          status: 'INACTIVE',
        },
      }),
    ]);

    await this.rabbitMQ.publish('attendance.events', 'employee.deleted', {
      eventType: 'EMPLOYEE_DELETED',
      service: 'employee-service',
      actorUserId,
      entityType: 'EMPLOYEE',
      entityId: updatedEmployee.id,
      payload: {
        targetUserId: updatedEmployee.userId,
        employeeNumber: updatedEmployee.employeeNumber,
        name: updatedEmployee.name,
        deletionType: 'SOFT_DELETE',
      },
    });

    return {
      message: 'Employee deleted successfully',
      employee: updatedEmployee,
    };
  }
}
