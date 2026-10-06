import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(@Req() request: any) {
    return this.attendanceService.checkIn(request.user.userId);
  }

  @Post('check-out')
  async checkOut(@Req() request: any) {
    return this.attendanceService.checkOut(request.user.userId);
  }

  @Get('summary')
  async summary(
    @Req() request: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.summary(
      request.user.userId,
      startDate,
      endDate,
    );
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async adminStats(@Query('date') date?: string) {
    return this.attendanceService.getAdminStats(date);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async adminSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.findAll(
      startDate,
      endDate,
      employeeId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }
}
