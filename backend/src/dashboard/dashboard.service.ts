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
      // === 1️⃣ Parse month (supports "11-2025" or "October-2025") ===
      let startOfMonth: Date;

      if (month) {
        if (/^\d{2}-\d{4}$/.test(month)) {
          // Format: "11-2025"
          const [m, y] = month.split('-');
          startOfMonth = new Date(Number(y), Number(m) - 1, 1);
        } else if (/^[A-Za-z]+-\d{4}$/.test(month)) {
          // Format: "October-2025"
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

      // === 3️⃣ Valid status list ===
      const statusList = [
        'WaitingForApproval',
        'Approved',
        'ReviewedByFinance',
        'ReadyForPayment',
        'Paid',
        'Rejected',
      ];

      // === 4️⃣ Expense Aggregation ===
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
                  total: { $sum: '$amount' }
                }
              },
              {
                $lookup: {
                  from: 'offices',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'office'
                }
              },
              {
                $unwind: {
                  path: '$office',
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  _id: 0,
                  office: {
                    _id: '$office._id',
                    name: '$office.name'
                  },
                  total: { $ifNull: ['$total', 0] }
                }
              },
              {
                $sort: { 'office.name': 1 }
              }
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
      function formatMonthYear(dateStr: string | Date): string {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const year = date.getFullYear();
        return `${month}-${year}`;
      }
      const formattedMonth = formatMonthYear(startOfMonth);
      const formattedNextMonth = formatMonthYear(startOfNextMonth);
      // === 5️⃣ Petty Cash Aggregations (STRICT by month + office) ===
      const pettyCashMatch = {
        transactionType: 'expense',
        month: { $gte: formattedMonth, $lt: formattedNextMonth },
        ...(officeId ? { office: new Types.ObjectId(officeId) } : {}),
      };

      // 👉 Office-wise petty cash totals for current month
      const pettyCashAgg = this.txnModel.aggregate([
        {
          $match: {
            transactionType: 'expense',
            month: formattedMonth
          }
        },
        {
          $group: {
            _id: '$office',
            totalExpense: { $sum: '$amount' }
          }
        },
        {
          $lookup: {
            from: 'offices',
            localField: '_id',
            foreignField: '_id',
            as: 'office'
          }
        },
        {
          $unwind: {
            path: '$office',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            office: {
              _id: '$office._id',
              name: '$office.name'
            },
            totalExpense: { $ifNull: ['$totalExpense', 0] },
            month: month
          }
        },
        {
          $sort: { 'office.name': 1 }
        }
      ]);

      // 👉 Total petty cash expense for current month
      const pettyCashTotalAgg = this.txnModel.aggregate([
        { $match: pettyCashMatch },
        {
          $group: {
            _id: null,
            totalPettyCashExpense: { $sum: '$amount' },
          },
        },
      ]);

      // === 6️⃣ Vendor Count ===
      const vendorCountPromise = this.vendorModel.countDocuments({}).exec();

      // === 7️⃣ Execute all in parallel ===
      const [expenseResult, pettyCashTotals, officeWisePettyCash, vendorCount] =
        await Promise.all([
          expenseAgg.exec(),
          pettyCashTotalAgg.exec(),
          pettyCashAgg.exec(),
          vendorCountPromise,
        ]);

      // === 8️⃣ Process results ===
      const expenseFacet = expenseResult?.[0] ?? {};
      const totals = expenseFacet.totals?.[0] ?? { totalAmount: 0, totalCount: 0 };
      const currentMonthObj = expenseFacet.currentMonth?.[0] ?? { currentSum: 0 };
      const officeWiseExpenses = expenseFacet.officeWise ?? [];
      const statusCountsRaw = expenseFacet.statusCounts ?? [];

      // Normalize status counts
      const countsByStatus: Record<string, number> = {};
      for (const s of statusList) countsByStatus[s] = 0;
      for (const row of statusCountsRaw) {
        const key = row._id ?? 'Unknown';
        countsByStatus[key] = row.count;
      }

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
