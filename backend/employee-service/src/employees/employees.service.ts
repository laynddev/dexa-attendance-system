import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

    async create(
    createEmployeeDto: CreateEmployeeDto,
    authorization: string,
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

      // 2. Create employee profile
      return this.prisma.employee.create({
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

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: {
        id,
      },
      data: updateEmployeeDto,
    });
  }

  async findByUserId(userId: string) {
  return this.prisma.employee.findUnique({
    where: {
      userId,
    },
  });
}
}