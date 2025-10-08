import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateOfficeDto {
   @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
