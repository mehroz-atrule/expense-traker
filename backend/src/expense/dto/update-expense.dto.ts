import { OmitType, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PartialType(
  OmitType(CreateExpenseDto, ['WHT', 'advanceTax'] as const),
) {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  WHT?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  advanceTax?: number;

  
}
