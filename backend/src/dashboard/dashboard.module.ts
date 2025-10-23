import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Expense, ExpenseSchema } from '../expense/schemas/expense.schema';
import { Vendor, VendorSchema } from '../vendor/schemas/vendor.schema';
import { PettyCashSummary, PettyCashSummarySchema } from '../pettycash/schemas/pettycashsummary.schema';
import { PettyCashTransaction, PettyCashTransactionSchema } from '../pettycash/schemas/pettycash.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: PettyCashSummary.name, schema: PettyCashSummarySchema },
      { name: PettyCashTransaction.name, schema: PettyCashTransactionSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
