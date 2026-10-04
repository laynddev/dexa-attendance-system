import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly rabbitMQ: AmqpConnection,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.roles.map(
      (userRole) => userRole.role.name,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    await this.rabbitMQ.publish(
      'attendance.events',
      'auth.user.login',
      {
        eventType: 'USER_LOGIN',
        service: 'auth-service',
        actorUserId: user.id,
        entityType: 'USER',
        entityId: user.id,
        payload: {
          email: user.email,
        },
      },
    );

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

async createUser(
  email: string,
  password: string,
  actorUserId: string,
) {
  const existingUser = await this.prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const employeeRole = await this.prisma.role.findUnique({
    where: {
      name: 'EMPLOYEE',
    },
  });

  if (!employeeRole) {
    throw new Error('EMPLOYEE role does not exist');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await this.prisma.user.create({
    data: {
      email,
      passwordHash,
      isActive: true,
      roles: {
        create: {
          roleId: employeeRole.id,
        },
      },
    },
  });

 await this.rabbitMQ.publish(
  'attendance.events',
  'auth.user.created',
  {
    eventType: 'USER_CREATED',
    service: 'auth-service',
    actorUserId,
    entityType: 'USER',
    entityId: user.id,
    payload: {
      email: user.email,
      role: 'EMPLOYEE',
    },
  },
);

  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || !user.isActive) {
    throw new UnauthorizedException('User not found or inactive');
  }

  const passwordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new UnauthorizedException(
      'Current password is incorrect',
    );
  }

  const newPasswordHash = await bcrypt.hash(
    newPassword,
    10,
  );

  await this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  await this.rabbitMQ.publish(
    'attendance.events',
    'auth.password.changed',
    {
      eventType: 'PASSWORD_CHANGED',
      service: 'auth-service',
      actorUserId: userId,
      entityType: 'USER',
      entityId: userId,
      payload: {
        email: user.email,
      },
    },
  );

  return {
    message: 'Password changed successfully',
  };
}

}