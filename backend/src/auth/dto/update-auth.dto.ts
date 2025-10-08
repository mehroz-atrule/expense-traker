import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { SignUpDto } from './signup.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(SignUpDto) {
  @IsOptional()
  @ApiProperty()
  @IsString()
  username: string;

    @IsOptional()
  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}