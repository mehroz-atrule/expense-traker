import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { CloudinaryService } from 'src/upload/cloudinary.service';
import { CreatePettycashDto } from './dto/create-pettycash.dto';
import { UpdatePettycashDto } from './dto/update-pettycash.dto';
import { QueryPettycashDto } from './dto/query-pettycash.dto';
import {
  PettyCashTransaction,
  PettyCashTransactionDocument,
} from './schemas/pettycash.schema';
import {
  PettyCashSummary,
  PettyCashSummaryDocument,
} from './schemas/pettycashsummary.schema';

@Injectable()
export class PettycashService {
  constructor(
    @InjectModel(PettyCashTransaction.name)
    private txnModel: Model<PettyCashTransactionDocument>,
    @InjectModel(PettyCashSummary.name)
    private summaryModel: Model<PettyCashSummaryDocument>,
    private readonly cloudinary: CloudinaryService,
  ) { }

  // ================= CREATE TRANSACTION =================
  async create(createDto: CreatePettycashDto, chequeImage?: any) {
    const session = await this.txnModel.db.startSession();
    session.startTransaction();

    try {
      const officeId = new Types.ObjectId(createDto.office);
      const month = createDto.month || new Date().toISOString().slice(0, 7); // e.g., "2025-10"

      const chequeImageUrl = chequeImage
        ? (await this.cloudinary.uploadBuffer(chequeImage.buffer, 'pettycash')).secure_url
        : undefined;

      const amount = Number(createDto.amount);
      if (isNaN(amount) || amount <= 0) throw new BadRequestException('Invalid transaction amount');

      const isIncome = createDto.transactionType === 'income';
      const debit = isIncome ? 0 : amount;
      const credit = isIncome ? amount : 0;

      // ✅ 1. Find last transaction in this office
      let lastTxn = await this.txnModel
        .findOne({ office: officeId })
        .sort({ dateOfPayment: -1, _id: -1 })
        .session(session);

      let lastBalance = 0;

      // ✅ 2. If no transactions in current month, carry forward from previous month
      const firstTxnOfMonth = await this.txnModel
        .findOne({ office: officeId, month })
        .session(session);

      if (!firstTxnOfMonth) {
        // extract previous month in YYYY-MM format
        const [year, monthStr] = month.split('-');
        const prevMonthDate = new Date(Number(year), Number(monthStr) - 2, 1);
        const prevMonth = prevMonthDate.toISOString().slice(0, 7); // e.g., "2025-09"

        // get previous month's summary
        const prevSummary = await this.summaryModel
          .findOne({ office: officeId, month: prevMonth })
          .session(session);

        lastBalance = prevSummary?.closingBalance ?? 0; // use previous month closing as opening
      } else {
        // else, continue from last txn
        lastBalance = lastTxn?.balanceAfter ?? 0;
      }

      // ✅ 3. Compute balance after this txn
      const balanceAfter = isIncome ? lastBalance + amount : lastBalance - amount;

      // ✅ 4. Create the transaction
      const txn = await this.txnModel.create(
        [
          {
            office: officeId,
            transactionType: createDto.transactionType,
            amount,
            debit,
            credit,
            balanceAfter,
            description: createDto.description || '',
            reference: createDto.transactionNo || createDto.chequeNumber || '',
            bankName: createDto.bankName || '',
            chequeImage: chequeImageUrl,
            month,
            dateOfPayment: new Date(createDto.dateOfPayment || Date.now()),
          },
        ],
        { session },
      );

      // ✅ 5. Update summary with new balance
      await this.updateSummary(officeId, month, balanceAfter, session);

      await session.commitTransaction();
      session.endSession();

      return txn[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('❌ Error creating transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }


  // ================= UPDATE TRANSACTION =================
  async update(id: string, updateDto: UpdatePettycashDto, image?: any) {
    const session = await this.txnModel.db.startSession();
    session.startTransaction();

    try {
      if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

      const txn = await this.txnModel.findById(id).session(session);
      if (!txn) throw new NotFoundException('Transaction not found');

      let chequeImageUrl = txn.chequeImage;
      if (image?.buffer) {
        if (chequeImageUrl)
          await this.cloudinary.deleteByUrl(chequeImageUrl).catch(() => undefined);
        chequeImageUrl = (await this.cloudinary.uploadBuffer(image.buffer, 'pettycash')).secure_url;
      }

      const transactionType = updateDto.transactionType ?? txn.transactionType;
      const amount = Number(updateDto.amount ?? txn.amount ?? 0);
      const debit = transactionType === 'expense' ? amount : 0;
      const credit = transactionType === 'income' ? amount : 0;

      // Previous transaction for balance
      const previous = await this.txnModel
        .findOne({ office: txn.office, dateOfPayment: { $lt: txn.dateOfPayment } })
        .sort({ dateOfPayment: -1, _id: -1 })
        .session(session);

      const previousBalance = previous?.balanceAfter ?? 0;
      const newBalance = previousBalance + credit - debit;

      const updatedTxn = await this.txnModel.findByIdAndUpdate(
        id,
        {
          ...updateDto,
          chequeImage: chequeImageUrl,
          debit,
          credit,
          balanceAfter: newBalance,
        },
        { new: true, session },
      );

      // Recalculate following transactions
      await this.recalculateFollowing(txn.office, txn.dateOfPayment, newBalance, session);

      await session.commitTransaction();
      session.endSession();

      return updatedTxn;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('❌ Error updating transaction:', error);
      throw new InternalServerErrorException('Failed to update transaction');
    }
  }

  // ================= REMOVE TRANSACTION =================
  async remove(id: string) {
    const session = await this.txnModel.db.startSession();
    session.startTransaction();

    try {
      if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

      const txn = await this.txnModel.findById(id).session(session);
      if (!txn) throw new NotFoundException('Transaction not found');

      if (txn.chequeImage)
        await this.cloudinary.deleteByUrl(txn.chequeImage).catch(() => undefined);

      await this.txnModel.findByIdAndDelete(id, { session });

      // Previous transaction for balance
      const previous = await this.txnModel
        .findOne({ office: txn.office, dateOfPayment: { $lt: txn.dateOfPayment } })
        .sort({ dateOfPayment: -1, _id: -1 })
        .session(session);

      const lastBalance = previous?.balanceAfter ?? 0;

      // Recalculate following transactions
      await this.recalculateFollowing(txn.office, txn.dateOfPayment, lastBalance, session);

      await session.commitTransaction();
      session.endSession();

      return txn;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('❌ Error removing transaction:', error);
      throw new InternalServerErrorException('Failed to remove transaction');
    }
  }

  // ================= FIND ALL =================
  async findAll(query: QueryPettycashDto) {
    try {
      const page = Math.max(1, Number(query?.page ?? 1));
      const limit = Math.max(1, Number(query?.limit ?? 1000));
      const filter: FilterQuery<PettyCashTransaction> = {};

      // 🏢 Office filter
      if (query?.office) {
        if (!Types.ObjectId.isValid(query.office)) {
          throw new BadRequestException('Invalid office id');
        }
        filter.office = new Types.ObjectId(query.office);
      }

      // 📅 Month filter
      if (query?.month) {
        filter.month = query.month;
      }

      // 🗓️ Date range filter
      if (query?.startDate || query?.endDate) {
        const dateFilter: Record<string, Date> = {};
        if (query.startDate) dateFilter.$gte = new Date(query.startDate);
        if (query.endDate) dateFilter.$lte = new Date(query.endDate);
        filter.dateOfPayment = dateFilter;
      }

      // 🔍 Text search
      if (query?.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [
          { reference: regex },
          { bankName: regex },
          { description: regex },
        ];
      }

      const skip = (page - 1) * limit;

      // ⚡ Fetch both transactions and summary in parallel
      const [data, total, summary] = await Promise.all([
        this.txnModel
          .find(filter)
          .populate('office')
          .sort({ dateOfPayment: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),

        this.txnModel.countDocuments(filter).exec(),

        // ✅ Fetch summary for same office & month (if both provided)
        query?.office && query?.month
          ? this.summaryModel
            .findOne({
              office: new Types.ObjectId(query.office),
              month: query.month,
            }).populate('office')
            .lean()
            .exec()
          : null,
      ]);

      return {
        data,
        total,
        page,
        limit,
        summary: summary || {
          openingBalance: 0,
          closingBalance: 0,
          note: 'No summary found for this office/month',
        },
      };
    } catch (error) {
      console.error('❌ Error fetching pettycash list:', error);
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  // ================= FIND ONE =================
  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid transaction id');
      const txn = await this.txnModel.findById(id).exec();
      if (!txn) throw new NotFoundException('Transaction not found');
      return txn;
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch transaction');
    }
  }

  // ================= PRIVATE HELPERS =================

  // Update summary intelligently
  private async updateSummary(
    office: Types.ObjectId,
    month: string,
    closingBalance: number,
    session?: any,
  ) {
    let summary = await this.summaryModel.findOne({ office, month }).session(session);
    if (summary) {
      summary.closingBalance = closingBalance;
      await summary.save({ session });
    } else {
      // Get previous month closing as opening
      const prevSummary = await this.summaryModel
        .findOne({ office })
        .sort({ month: -1 })
        .session(session);
      const openingBalance = prevSummary?.closingBalance ?? 0;
      await this.summaryModel.create(
        [{ office, month, openingBalance, closingBalance }],
        { session },
      );
    }
  }

  // Recalculate balances for all following transactions
  private async recalculateFollowing(
    office: Types.ObjectId,
    fromDate: Date,
    startingBalance: number,
    session?: any,
  ) {
    const following = await this.txnModel
      .find({ office, dateOfPayment: { $gt: fromDate } })
      .sort({ dateOfPayment: 1, _id: 1 })
      .session(session);

    let lastBalance = startingBalance;
    for (const txn of following) {
      const debit = txn.transactionType === 'expense' ? txn.amount : 0;
      const credit = txn.transactionType === 'income' ? txn.amount : 0;
      const newBalance = lastBalance + credit - debit;

      await this.txnModel.findByIdAndUpdate(txn._id, { balanceAfter: newBalance }, { session });
      lastBalance = newBalance;

      // Update summary for the month of this transaction
      await this.updateSummary(txn.office, txn.month, newBalance, session);
    }
  }
}
