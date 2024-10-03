import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authEmailLoginDto: AuthEmailLoginDto) {
    return this.authService.login(authEmailLoginDto);
  }

  @Post('register')
  async register(@Body() authRegisterLoginDto: AuthRegisterLoginDto) {
    return this.authService.register(authRegisterLoginDto);
  }
}
