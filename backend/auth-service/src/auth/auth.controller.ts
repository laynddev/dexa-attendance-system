import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ) {
    return this.authService.login(body.email, body.password);
  }

@Post('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async createUser(
  @Body() body: { email: string; password: string },
) {
  return this.authService.createUser(
    body.email,
    body.password,
  );
}

  @Get('me')
@UseGuards(JwtAuthGuard)
async me(@Req() request: any) {
  return request.user;
}

@Get('admin-test')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
async adminTest(@Req() request: any) {
  return {
    message: 'Admin authorization successful',
    user: request.user,
  };
}
}