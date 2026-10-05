import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly rabbitMQ: AmqpConnection,
    ) {}
    

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

    const attendance = await this.prisma.attendance.create({
  data: {
    employeeId,
    attendanceDate,
    checkInAt: now,
  },
  include: {
    employee: true,
  },
});

await this.rabbitMQ.publish(
  'attendance.events',
  'attendance.check-in',
  {
    eventType: 'ATTENDANCE_CHECK_IN',
    service: 'attendance-service',
    actorUserId: userId,
    entityType: 'ATTENDANCE',
    entityId: attendance.id,
    payload: {
      employeeId: employee.id,
      employeeNumber: employee.employee_number,
      attendanceDate: attendance.attendanceDate,
      checkInAt: attendance.checkInAt,
    },
  },
);

return attendance;
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

  const updatedAttendance = await this.prisma.attendance.update({
  where: { id: attendance.id },
  data: {
    checkOutAt: now,
  },
  include: {
    employee: true,
  },
});

await this.rabbitMQ.publish(
  'attendance.events',
  'attendance.check-out',
  {
    eventType: 'ATTENDANCE_CHECK_OUT',
    service: 'attendance-service',
    actorUserId: userId,
    entityType: 'ATTENDANCE',
    entityId: updatedAttendance.id,
    payload: {
      employeeId: employee.id,
      employeeNumber: employee.employee_number,
      attendanceDate: updatedAttendance.attendanceDate,
      checkInAt: updatedAttendance.checkInAt,
      checkOutAt: updatedAttendance.checkOutAt,
    },
  },
);

return updatedAttendance;
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
async findAll(
  startDate?: string,
  endDate?: string,
  employeeId?: string,
  page = 1,
  limit = 10,
) {
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

  const safePage =
    Number.isInteger(page) && page > 0
      ? page
      : 1;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <= 100
      ? limit
      : 10;

  const skip =
    (safePage - 1) * safeLimit;

  const where = {
    attendanceDate: {
      gte: start,
      lte: end,
    },

    ...(employeeId
      ? {
          employeeId,
        }
      : {}),
  };

  const [attendances, total] =
    await Promise.all([
      this.prisma.attendance.findMany({
        where,

        skip,
        take: safeLimit,

        orderBy: [
          {
            attendanceDate: 'desc',
          },
          {
            checkInAt: 'desc',
          },
        ],

        include: {
          employee: true,
        },
      }),

      this.prisma.attendance.count({
        where,
      }),
    ]);

  const totalPages = Math.ceil(
    total / safeLimit,
  );

  return {
    data: attendances,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}

}