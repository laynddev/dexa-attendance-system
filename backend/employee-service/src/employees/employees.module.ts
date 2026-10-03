import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    JwtStrategy,
  ],
})
export class EmployeesModule {}