import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { User } from './schemas/user.schema';
import { AppLogger } from '../logger/logger.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: AppLogger,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) { }

  async signUp(signUpDto: SignUpDto): Promise<{ message: string; user: Partial<User> }> {

    this.logger.log('Attempting user signup', { username: signUpDto });

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: signUpDto.username }
      ]
    });

    if (existingUser) {
      if (existingUser.username === signUpDto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signUpDto.password, 12);

    // Create user
    const newUser = new this.userModel({
      ...signUpDto,
      password: hashedPassword,

    });

    const savedUser = await newUser.save();

    // Remove password from response
    const { password, ...userWithoutSensitiveInfo } = savedUser.toObject();

    this.logger.log('User successfully registered', { userId: savedUser._id, username: savedUser.username, role: savedUser.role });

    return {
      message: 'User successfully registered',
      user: userWithoutSensitiveInfo
    };

  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {

    this.logger.log('Attempting user login', { username: loginDto.username });

    // Find user
    const user = await this.userModel.findOne({ username: loginDto.username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload = {
      username: user.username,
      sub: user._id,
      role: user.role
    };
    console.log('JWT Payload for token generation:', payload);

    const accessToken = this.jwtService.sign(payload,
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '1d'
      });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '7d'
    });

    // Update user with refresh token and last login
    await this.userModel.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLogin: new Date(),
    });

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user.toObject();

    this.logger.log('User successfully logged in', { userId: user._id, username: user.username });

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };

  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<{ message: string; user: Partial<User> }> {

    this.logger.log('Attempting to update user', { userId });

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    // Check for unique constraints if email or username is being updated
    if (updateUserDto.username) {
      const existingUser = await this.userModel.findOne({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              { username: updateUserDto.username }
            ]
          }
        ]
      });

      if (existingUser) {
        if (existingUser.username === updateUserDto.username) {
          throw new ConflictException('Username already exists');
        }
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { ...updateUserDto },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive information
    const { password, ...userWithoutSensitiveInfo } = updatedUser.toObject();

    this.logger.log('User successfully updated', { userId });

    return {
      message: 'User successfully updated',
      user: userWithoutSensitiveInfo
    };

  }

  async deleteUser(userId: string): Promise<{ message: string }> {

    this.logger.log('Attempting to delete user', { userId });

    const deletedUser = await this.userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    this.logger.log('User successfully deleted', { userId });

    return {
      message: 'User successfully deleted'
    };

  }

  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string }> {

    const user = await this.userModel.findOne({ _id: userId, refreshToken });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify refresh token
    try {
      this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload = {
      username: user.username,
      sub: user._id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m'
    });

    return { accessToken };

  }

  async validateUserById(userId: string): Promise<Partial<User> | null> {

    const user = await this.userModel.findById(userId);
    if (!user) return null;

    const { password, ...userWithoutSensitiveInfo } = user.toObject();
    return userWithoutSensitiveInfo;

  }
}