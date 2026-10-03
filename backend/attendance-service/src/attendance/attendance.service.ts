import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) {}
    

    async findEmployeeByUserId(userId: string) {
      return this.prisma.employees.findUnique({
        where: {
          user_id: userId,
        },
      });
    }

        async checkIn(userId: string) {
    const employee = await this.findEmployeeByUserId(userId);

  if (!employee) {
    throw new NotFoundException('Employee profile not found');
  }

  if (employee.status !== 'ACTIVE') {
    throw new ConflictException('Employee is not active');
  }

  const employeeId = employee.id;

    const now = new Date();

    const wibTime = new Date(
        now.getTime() + 7 * 60 * 60 * 1000,
    );

    const attendanceDate = new Date(
        Date.UTC(
            wibTime.getUTCFullYear(),
            wibTime.getUTCMonth(),
            wibTime.getUTCDate(),
        ),
    );

    const existingAttendance =
      await this.prisma.attendance.findUnique({
        where: {
          employeeId_attendanceDate: {
            employeeId,
            attendanceDate,
          },
        },
      });

    if (existingAttendance) {
      throw new ConflictException(
        'Employee has already checked in today',
      );
    }

    return this.prisma.attendance.create({
      data: {
        employeeId,
        attendanceDate,
        checkInAt: now,
      },
      include: {
        employee: true,
      },
    });
  }


async checkOut(userId: string) {
  const employee = await this.findEmployeeByUserId(userId);

  if (!employee) {
    throw new NotFoundException('Employee profile not found');
  }

  if (employee.status !== 'ACTIVE') {
    throw new ConflictException('Employee is not active');
  }

  const employeeId = employee.id;

  // 3. Current timestamp
  const now = new Date();

  // 4. Convert UTC time to WIB (UTC+7)
  const wibTime = new Date(
    now.getTime() + 7 * 60 * 60 * 1000,
  );

  // 5. Get WIB calendar date
  const attendanceDate = new Date(
    Date.UTC(
      wibTime.getUTCFullYear(),
      wibTime.getUTCMonth(),
      wibTime.getUTCDate(),
    ),
  );

  // 6. Find today's attendance
  const attendance =
    await this.prisma.attendance.findUnique({
      where: {
        employeeId_attendanceDate: {
          employeeId,
          attendanceDate,
        },
      },
    });

  // 7. Employee must check in first
  if (!attendance) {
    throw new ConflictException(
      'Employee has not checked in today',
    );
  }

  // 8. Employee cannot check out twice
  if (attendance.checkOutAt) {
    throw new ConflictException(
      'Employee has already checked out today',
    );
  }

  // 9. Update check-out time
  return this.prisma.attendance.update({
    where: {
      id: attendance.id,
    },
    data: {
      checkOutAt: now,
    },
    include: {
      employee: true,
    },
  });
}

async summary(
  userId: string,
  startDate?: string,
  endDate?: string,
) {
  const employee = await this.findEmployeeByUserId(userId);

  if (!employee) {
    throw new NotFoundException('Employee profile not found');
  }

  const employeeId = employee.id;

  const now = new Date();

  // Convert current UTC time to WIB
  const wibTime = new Date(
    now.getTime() + 7 * 60 * 60 * 1000,
  );

  // Default: first day of current month
  const defaultStartDate = new Date(
    Date.UTC(
      wibTime.getUTCFullYear(),
      wibTime.getUTCMonth(),
      1,
    ),
  );

  // Default: today in WIB
  const defaultEndDate = new Date(
    Date.UTC(
      wibTime.getUTCFullYear(),
      wibTime.getUTCMonth(),
      wibTime.getUTCDate(),
    ),
  );

  const start = startDate
    ? new Date(`${startDate}T00:00:00.000Z`)
    : defaultStartDate;

  const end = endDate
    ? new Date(`${endDate}T00:00:00.000Z`)
    : defaultEndDate;

  return this.prisma.attendance.findMany({
    where: {
      employeeId,
      attendanceDate: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      attendanceDate: 'asc',
    },
  });
}

async findAll() {
  return this.prisma.attendance.findMany({
    orderBy: {
      attendanceDate: 'desc',
    },
    include: {
      employee: true,
    },
  });
}

}