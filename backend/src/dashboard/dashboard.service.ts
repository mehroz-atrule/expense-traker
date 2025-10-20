import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../expense/schemas/expense.schema';
import { Vendor } from '../vendor/schemas/vendor.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
  ) { }

  async getStats() {
    try {
      const [statusAgg, totals, totalVendors] = await Promise.all([
        this.expenseModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]).exec(),
        this.expenseModel.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' },
              totalCount: { $sum: 1 },
            },
          },
        ]).exec(),
        this.vendorModel.countDocuments({}).exec(),
      ]);

      const statusList = [
        'New',
        'Waiting for Approval',
        'Approved',
        'Reviewed by Finance',
        'Preparing for payment',
        'Ready for payment',
        'Paid',
      ];

      const countsByStatus: Record<string, number> = Object.fromEntries(
        statusList.map((s) => [s, 0]),
      );
      for (const s of statusAgg) {
        const key = s._id ?? 'Unknown';
        countsByStatus[key] = s.count;
      }

      const totalAmount = totals[0]?.totalAmount ?? 0;
      const totalCount = totals[0]?.totalCount ?? 0;

      return {
        totalAmount,
        totalCount,
        totalVendors,
        countsByStatus,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to load dashboard stats');
    }
  }
}
