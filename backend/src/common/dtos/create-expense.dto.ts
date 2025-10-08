import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Title of the expense' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Amount spent' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Expense category', required: false })
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Payment method', required: false })
  @IsString()
  paymentMethod?: string;
}
