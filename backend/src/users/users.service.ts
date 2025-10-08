import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { AppLogger } from 'src/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/types/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: AppLogger,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) { }
  async create(createUserDto: CreateUserDto): Promise<{ message: string; user: Partial<User> }> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: createUserDto.email }
        ]
      });

      if (existingUser) {
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('email already exists');
        }
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      // Create user
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role
      });

      const savedUser = await newUser.save();

      // Remove password from response
      const { password, ...userWithoutSensitiveInfo } = savedUser.toObject();

      return {
        message: 'User successfully created',
        user: userWithoutSensitiveInfo
      };
    } catch (error) {
      this.logger.error('Error during user creation', error, { email: createUserDto.email });
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Could not create user');
    }
  }

  async findAll(): Promise<{
    message: string;
    users: Partial<User>[];
  }> {
    try {
      const res = await this.userModel.find().exec();
      if (!res) {
        throw new InternalServerErrorException('Could not retrieve users');
      }
      const datawithoutpassword = res.map((user) => {
        const { password, ...userWithoutSensitiveInfo } = user.toObject();
        return userWithoutSensitiveInfo;
      });
      return {
        message: 'Users successfully retrieved',
        users: datawithoutpassword
      };
    } catch (error) {
      this.logger.error('Error during user retrieval', error);
      throw new InternalServerErrorException('Could not retrieve users');
    }
  }

  async findOne(id: string): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    console.log(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new InternalServerErrorException('Could not retrieve user');
    }
    const { password, ...userWithoutSensitiveInfo } = user.toObject();

    return {
      message: 'User successfully retrieved',
      user: userWithoutSensitiveInfo
    };
  }


  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new InternalServerErrorException('Could not retrieve user');
      }

      if (updateUserDto.password) {
        const hashedPassword = await bcrypt.hash(updateUserDto.password, 12);
        updateUserDto.password = hashedPassword;
      }
      updateUserDto.role = (updateUserDto.role as Role) || user.role;
      updateUserDto.email = updateUserDto.email || user.email;
      updateUserDto.username = updateUserDto.username || user.username;



      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });

      if (!updatedUser) {
        throw new InternalServerErrorException('Could not update user');
      }

      return {
        message: 'User successfully updated',
        user: {
          ...updatedUser.toObject(),
          password: undefined, // Remove password from response
        }
      };
    } catch (error) {
      this.logger.error('Error during user update', error);
      throw new InternalServerErrorException('Could not update user');
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new InternalServerErrorException('Could not retrieve user');
      }
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new InternalServerErrorException('Could not delete user');
      }
      return {
        message: 'User successfully deleted',
        user: {
          ...deletedUser.toObject(),
          password: undefined,
        }
      };
    } catch (error) {
      this.logger.error('Error during user deletion', error);
      throw new InternalServerErrorException('Could not delete user');
    }
  }
}