import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePettycashDto {
  @ApiProperty({ description: 'Office ID (ObjectId)', example: '68e642462b16b15d0ce5a584' })
  @IsString()
  @IsNotEmpty()
  office: string;

  @ApiProperty({
    description: 'Transaction type (income for receiving cash, expense for spending)',
    enum: ['income', 'expense'],
    example: 'income',
  })
  @IsEnum(['income', 'expense'])
  @IsNotEmpty()
  transactionType: 'income' | 'expense';

  @ApiProperty({ description: 'Transaction amount', example: 5000 })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ title: 'Transaction title', example: 'Fuel reimbursement' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Transaction description', example: 'Fuel reimbursement' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Transaction number or reference ID', example: 'TXN-2025-001' })
  @IsString()
  @IsOptional()
  transactionNo?: string;

  @ApiProperty({ description: 'Cheque number (if applicable)', example: 'CHQ-98765' })
  @IsString()
  @IsOptional()
  chequeNumber?: string;

  @ApiProperty({ description: 'Bank name (if applicable)', example: 'HBL Bank' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiProperty({ description: 'Month of transaction (for reporting)', example: '10-2025' })
  @IsString()
  month?: string;

  @ApiProperty({ description: 'Date of payment', example: '2025-10-21T11:59:50.348Z' })
  @IsOptional()
  dateOfPayment?: Date;
}
