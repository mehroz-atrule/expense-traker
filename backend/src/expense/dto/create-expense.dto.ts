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
  WaitingForApproval = 'WaitingForApproval',
  Approved = 'Approved',
  InReviewByFinance = 'InReviewByFinance',
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
  status: Status = Status.WaitingForApproval;

  // image handled as file via multipart, not validated here

  @ApiProperty()
  @IsDateString()
  billDate: string; // ISO date string

  @ApiProperty()
  @IsDateString()
  dueDate: string; // ISO date string

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  paymentDate?: string; // ISO date string

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

  @ApiProperty({ description: 'Vendor ID(ObjectId)' })
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

  @ApiPropertyOptional()
  @IsOptional()
  // Accept string from multipart/form-data; convert in service
  @IsString()
  WHT?: string;

  @ApiPropertyOptional()
  @IsOptional()
  // Accept string from multipart/form-data; convert in service
  @IsString()
  advanceTax?: string;

  @ApiProperty()
  @IsString()
  amountAfterTax: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bankName?: string;

}
