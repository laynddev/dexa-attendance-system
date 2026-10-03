import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

async createUser(email: string, password: string) {
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

  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
}