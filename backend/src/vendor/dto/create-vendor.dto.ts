import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

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
  @IsNotEmpty()
  preferredBankName: string;

  @ApiProperty({ example: 'Acme Supplies Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  vendorAccountTitle: string;

  @ApiProperty({ example: 'PK36SCBL0000001123456702' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/)
  vendorIban: string;
}
