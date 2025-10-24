import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { Office, OfficeSchema } from './schemas/office.schema';
import { JwtModule } from '@nestjs/jwt';
import { Expense, ExpenseSchema } from 'src/expense/schemas/expense.schema';
import { PettyCashTransaction, PettyCashTransactionSchema } from 'src/pettycash/schemas/pettycash.schema';
import { PettyCashSummary, PettyCashSummarySchema } from 'src/pettycash/schemas/pettycashsummary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Office.name, schema: OfficeSchema },
    { name: Expense.name, schema: ExpenseSchema },
    { name: PettyCashTransaction.name, schema: PettyCashTransactionSchema }, { name: PettyCashSummary.name, schema: PettyCashSummarySchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [OfficeController],
  providers: [OfficeService],
  exports: [OfficeService],
})
export class OfficeModule { }
