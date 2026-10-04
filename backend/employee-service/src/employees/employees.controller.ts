import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

@Get('me')
@UseGuards(JwtAuthGuard)
async me(@Req() request: any) {
  return this.employeesService.findByUserId(
    request.user.userId,
  );
}

@Patch('me')
@UseGuards(JwtAuthGuard)
async updateMyProfile(
  @Body() updateMyProfileDto: UpdateMyProfileDto,
  @Req() request: any,
) {
  return this.employeesService.updateMyProfile(
    request.user.userId,
    updateMyProfileDto,
  );
}

  @Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async create(
  @Body() createEmployeeDto: CreateEmployeeDto,
  @Req() request: any,
) {
  const authorization = request.headers.authorization;

  return this.employeesService.create(
    createEmployeeDto,
    authorization,
    request.user.userId,
  );
}

  @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async update(
  @Param('id') id: string,
  @Body() updateEmployeeDto: UpdateEmployeeDto,
  @Req() request: any,
) {
  return this.employeesService.update(
    id,
    updateEmployeeDto,
    request.user.userId,
  );
}


}