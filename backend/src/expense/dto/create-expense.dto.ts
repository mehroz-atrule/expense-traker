import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export enum PaymentMethod {
  Cash = 'Cash',
  Cheque = 'Cheque',
  BankTransfer = 'BankTransfer',
  Card = 'Card',
}


// New 
// Waiting for Approval
// Approved 
// In Review by Finance
// Preparing for payment
// Ready for payment
// Paid
export enum Status {
  New = 'New',
  WaitingForApproval = 'WaitingForApproval',
  Approved = 'Approved',
  InReviewByFinance = 'InReviewByFinance',
  PreparingForPayment = 'PreparingForPayment',
  ReadyForPayment = 'ReadyForPayment',
  Paid = 'Paid',
  Rejected = 'Rejected',

}

export class CreateExpenseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status = Status.New;

  // image handled as file via multipart, not validated here

  @ApiProperty()
  @IsDateString()
  date: string; // ISO date string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string; // will be converted to number in service

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Office ID (ObjectId)' })
  @IsString()
  @IsNotEmpty()
  office: string;

  @ApiProperty({ description: 'Vendor ID or name depending on design' })
  @IsString()
  @IsNotEmpty()
  vendor: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  payment: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
