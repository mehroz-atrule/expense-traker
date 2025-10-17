import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePettycashDto {

  @ApiProperty({ description: 'Office ID (ObjectId)' })
  @IsString()
  @IsNotEmpty()
  office: string;

  @ApiProperty({ description: 'Petty Cash amount' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ description: 'Petty Cash date' })
  @IsString()
  @IsNotEmpty()
  dateOfPayment: Date;

  @ApiProperty({ description: 'Petty Cash transaction number' })
  @IsString()
  @IsOptional()
  transactionNo?: string;

  @ApiProperty({ description: 'Petty Cash cheque number' })
  @IsString()
  @IsOptional()
  chequeNumber?: string;

  @ApiProperty({ description: 'Petty Cash bank name' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ description: 'Petty Cash cheque image' })
  @IsString()
  @IsOptional()
  chequeImage?: string;

  @ApiProperty({ description: 'Petty Cash opening balance' })
  @IsString()
  @IsOptional()
  openingBalance?: string;

  @ApiProperty({ description: 'Petty Cash closing balance' })
  @IsString()
  @IsOptional()
  closingBalance?: string;

  @ApiProperty({ description: 'Petty Cash month' })
  @IsString()
  @IsOptional()
  month?: string;

}
