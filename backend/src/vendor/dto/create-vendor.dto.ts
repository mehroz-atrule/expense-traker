import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsNumber, IsOptional } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({ example: 'Acme Supplies' })
  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @ApiProperty({ example: 'Karachi, PK' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'CUST-00123' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'Habib Bank' })
  @IsString()
  @IsOptional()
  preferredBankName: string;

  @ApiProperty({ example: 'Acme Supplies Pvt Ltd' })
  @IsString()
  @IsOptional()
  vendorAccountTitle: string;

  @ApiProperty({ example: 'PK36SCBL0000001123456702' })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/)
  vendorIban: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  WHT?: number;

}
