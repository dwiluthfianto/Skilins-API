import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  Req,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller({ path: 'api/v1/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() authEmailLoginDto: AuthEmailLoginDto,
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(authEmailLoginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.send({
      status: 'success',
      message: 'Logged in successfully',
      accessToken,
    });
  }

  @Post('register')
  async register(@Body() authRegisterLoginDto: AuthRegisterLoginDto) {
    return this.authService.register(authRegisterLoginDto);
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getLoginUser(@Req() req: Request) {
    const user = req.user;

    return this.authService.getLoginUser(user['sub']);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      return res.status(HttpStatus.FORBIDDEN).send({
        status: 'error',
        message: 'Refresh token not found',
      });
    }

    try {
      const { accessToken, newRefreshToken } =
        await this.authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        status: 'success',
        accessToken,
      });
    } catch (err) {
      console.error(err.message);
      return res.status(HttpStatus.FORBIDDEN).send({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user;

    // Clear the refresh token from the database
    await this.authService.logout(user['sub']);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
    });

    return res.json({ status: 'success', message: 'Logged out successfully!' });
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Post('change-email')
  async changeEmail(
    @Body('uuid') uuid: string,
    @Body('newEmail') newEmail: string,
  ) {
    return this.authService.changeEmail(uuid, newEmail);
  }
}
