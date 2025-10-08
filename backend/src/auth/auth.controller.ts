import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')

export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @ApiOperation({ summary: 'User Signup' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Put('profile/:id')
  @ApiOperation({ summary: 'User Update' })
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(userId, updateUserDto);
  }

  @Delete('profile/:id')
  @ApiOperation({ summary: 'User Deletion' })
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') userId: string) {
    return this.authService.deleteUser(userId);
  }

  @Post('refresh/:id')
  @ApiOperation({ summary: 'Refresh Tokens' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Param('id') userId: string, @Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}