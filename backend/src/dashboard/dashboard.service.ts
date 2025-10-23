import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from '../expense/schemas/expense.schema';
import { Vendor } from '../vendor/schemas/vendor.schema';
import {
  PettyCashTransaction,
  PettyCashTransactionDocument,
} from '../pettycash/schemas/pettycash.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<Expense>,
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<Vendor>,
    @InjectModel(PettyCashTransaction.name)
    private readonly txnModel: Model<PettyCashTransactionDocument>,
  ) { }

  async getStats(officeId?: string, month?: string) {
    try {
      // === 1️⃣ Parse month (supports "10-2025" or "October-2025") ===
      let startOfMonth: Date;
      if (month) {
        if (/^\d{2}-\d{4}$/.test(month)) {
          const [m, y] = month.split('-');
          startOfMonth = new Date(Number(y), Number(m) - 1, 1);
        } else if (/^[A-Za-z]+-\d{4}$/.test(month)) {
          const [name, y] = month.split('-');
          const m = new Date(`${name} 1, ${y}`).getMonth();
          startOfMonth = new Date(Number(y), m, 1);
        } else {
          throw new Error(`Invalid month format: ${month}`);
        }
      } else {
        const now = new Date();
        startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        month = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      }

      const startOfNextMonth = new Date(startOfMonth);
      startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

      // === 2️⃣ Office filter ===
      const officeFilter = officeId ? { office: new Types.ObjectId(officeId) } : {};

      // === 3️⃣ Status list ===
      const statusList = [
        'New',
        'Waiting for Approval',
        'Approved',
        'Reviewed by Finance',
        'Preparing for payment',
        'Ready for payment',
        'Paid',
      ];

      // === 4️⃣ Expense aggregation ===
      const expenseAgg = this.expenseModel.aggregate([
        { $match: officeFilter },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  totalAmount: { $sum: '$amount' },
                  totalCount: { $sum: 1 },
                },
              },
            ],
            currentMonth: [
              {
                $match: {
                  billDate: { $gte: startOfMonth, $lt: startOfNextMonth },
                },
              },
              {
                $group: {
                  _id: null,
                  currentSum: { $sum: '$amount' },
                },
              },
            ],
            officeWise: [
              {
                $group: {
                  _id: '$office',
                  total: { $sum: '$amount' },
                },
              },
            ],
            statusCounts: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      // === 5️⃣ Petty Cash (strict month + office filter) ===
      const pettyCashAgg = this.txnModel.aggregate([
        {
          $match: {
            transactionType: 'expense',
            dateOfPayment: { $gte: startOfMonth, $lt: startOfNextMonth },
            ...officeFilter,
          },
        },
        {
          $group: {
            _id: '$office',
            totalExpense: { $sum: '$amount' },
          },
        },
        {
          $project: {
            _id: 0,
            office: '$_id',
            totalExpense: 1,
            month: month,
          },
        },
      ]);

      // === 6️⃣ Total petty cash (month filtered) ===
      const pettyCashTotalAgg = this.txnModel.aggregate([
        {
          $match: {
            transactionType: 'expense',
            dateOfPayment: { $gte: startOfMonth, $lt: startOfNextMonth },
            ...officeFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalPettyCashExpense: { $sum: '$amount' },
          },
        },
      ]);

      // === 7️⃣ Vendor Count ===
      const vendorCountPromise = this.vendorModel.countDocuments({}).exec();

      // === 8️⃣ Run all in parallel ===
      const [expenseResult, pettyCashTotals, officeWisePettyCash, vendorCount] =
        await Promise.all([
          expenseAgg.exec(),
          pettyCashTotalAgg.exec(),
          pettyCashAgg.exec(),
          vendorCountPromise,
        ]);

      const expenseFacet = expenseResult?.[0] ?? {};
      const totals = expenseFacet.totals?.[0] ?? { totalAmount: 0, totalCount: 0 };
      const currentMonthObj = expenseFacet.currentMonth?.[0] ?? { currentSum: 0 };
      const officeWiseExpensesRaw = expenseFacet.officeWise ?? [];
      const statusCountsRaw = expenseFacet.statusCounts ?? [];

      // normalize status counts
      const countsByStatus: Record<string, number> = {};
      for (const s of statusList) countsByStatus[s] = 0;
      for (const row of statusCountsRaw) {
        const key = row._id ?? 'Unknown';
        countsByStatus[key] = row.count;
      }

      // format office-wise expenses
      const officeWiseExpenses = officeWiseExpensesRaw.map((r) => ({
        office: r._id,
        total: r.total,
      }));

      const totalPettyCashExpense = pettyCashTotals?.[0]?.totalPettyCashExpense ?? 0;

      // === ✅ Final structured response ===
      return {
        month,
        office: officeId ?? 'All Offices',
        totalExpense: totals.totalAmount ?? 0,
        totalCount: totals.totalCount ?? 0,
        totalVendors: vendorCount ?? 0,
        currentMonthExpense: currentMonthObj.currentSum ?? 0,
        officeWiseExpenses,
        countsByStatus,
        totalPettyCashExpense,
        officeWisePettyCash,
      };
    } catch (error) {
      console.error('Dashboard getStats error:', error);
      throw new InternalServerErrorException('Failed to load dashboard stats');
    }
  }
}
