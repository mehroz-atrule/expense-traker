import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { CloudinaryService } from '../upload/cloudinary.service';
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
    private readonly txnModel: Model<PettyCashTransactionDocument>,
    @InjectModel(PettyCashSummary.name)
    private readonly summaryModel: Model<PettyCashSummaryDocument>,
    private readonly cloudinary: CloudinaryService,
  ) { }

  // ================= CREATE =================
  async create(createDto: CreatePettycashDto, chequeImage?: any) {
    const session: ClientSession = await this.txnModel.db.startSession();
    await session.startTransaction();

    try {
      if (!Types.ObjectId.isValid(createDto.office))
        throw new BadRequestException('Invalid office ID');

      const officeId = new Types.ObjectId(createDto.office);
      const month = createDto.month || this.formatMonth(new Date());
      const amount = Number(createDto.amount);
      if (isNaN(amount) || amount <= 0)
        throw new BadRequestException('Invalid transaction amount');

      const chequeImageUrl = chequeImage
        ? (await this.cloudinary.uploadBuffer(chequeImage.buffer, 'pettycash')).secure_url
        : undefined;

      const isIncome = createDto.transactionType === 'income';
      const debit = isIncome ? 0 : amount;
      const credit = isIncome ? amount : 0;

      // create record (balanceAfter will be recalculated by recalc)
      const [created] = await this.txnModel.create(
        [
          {
            office: officeId,
            title: createDto.title ?? '',
            transactionType: createDto.transactionType,
            amount,
            debit,
            credit,
            balanceAfter: 0,
            description: createDto.description ?? '',
            reference: createDto.transactionNo ?? createDto.chequeNumber ?? '',
            bankName: createDto.bankName ?? '',
            chequeImage: chequeImageUrl,
            month,
            dateOfPayment: new Date(createDto.dateOfPayment ?? Date.now()),
          },
        ],
        { session },
      );

      // Recalculate this month using previous month closing as opening
      const prevMonth = this.getPreviousMonth(month);
      const prevSummary = await this.summaryModel.findOne({ office: officeId, month: prevMonth }).session(session);
      const openingBalance = prevSummary?.closingBalance ?? 0;

      const closing = await this.recalculateMonthTransactions(officeId, month, openingBalance, session);

      // propagate closing to following months
      await this.propagateToFollowingMonths(officeId, month, closing, session);

      await session.commitTransaction();
      return created;
    } catch (err) {
      await session.abortTransaction();
      console.error('Error creating transaction:', err);
      throw new Error('Failed to create transaction', err);
    } finally {
      await session.endSession();
    }
  }

  // ================= UPDATE =================
  async update(id: string, updateDto: UpdatePettycashDto, image?: any) {
    const session: ClientSession = await this.txnModel.db.startSession();
    await session.startTransaction();

    try {
      if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

      const existing = await this.txnModel.findById(id).session(session);
      if (!existing) throw new NotFoundException('Transaction not found');

      const oldMonth = existing.month;
      const officeId = existing.office instanceof Types.ObjectId ? existing.office : new Types.ObjectId(existing.office);

      // handle image
      let chequeImageUrl = existing.chequeImage;
      if (image?.buffer) {
        if (chequeImageUrl) await this.cloudinary.deleteByUrl(chequeImageUrl).catch(() => null);
        chequeImageUrl = (await this.cloudinary.uploadBuffer(image.buffer, 'pettycash')).secure_url;
      }

      // ensure numeric and compute debit/credit
      const amount = updateDto.amount !== undefined ? Number(updateDto.amount) : Number(existing.amount);
      if (isNaN(amount) || amount <= 0) throw new BadRequestException('Invalid amount');

      const transactionType = updateDto.transactionType ?? existing.transactionType;
      const debit = transactionType === 'expense' ? amount : 0;
      const credit = transactionType === 'income' ? amount : 0;

      // apply update (may change month)
      const updated = await this.txnModel.findByIdAndUpdate(
        id,
        {
          ...updateDto,
          office: officeId,
          chequeImage: chequeImageUrl,
          amount,
          debit,
          credit,
        },
        { new: true, session },
      );

      // If month changed, we must recalc oldMonth then newMonth
      const newMonth = updated?.month;

      // Recalculate old month (if month changed or even if same – safe)
      const prevMonthOfOld = this.getPreviousMonth(oldMonth);
      const prevSummaryOld = await this.summaryModel.findOne({ office: officeId, month: prevMonthOfOld }).session(session);
      const openingOld = prevSummaryOld?.closingBalance ?? 0;
      const closingOld = await this.recalculateMonthTransactions(officeId, oldMonth, openingOld, session);

      // propagate from oldMonth closing to following months
      await this.propagateToFollowingMonths(officeId, oldMonth, closingOld, session);

      // If month changed (moved to another month), recalc newMonth too
      if (newMonth && newMonth !== oldMonth) {
        const prevMonthOfNew = this.getPreviousMonth(newMonth);
        const prevSummaryNew = await this.summaryModel.findOne({ office: officeId, month: prevMonthOfNew }).session(session);
        const openingNew = prevSummaryNew?.closingBalance ?? 0;
        const closingNew = await this.recalculateMonthTransactions(officeId, newMonth, openingNew, session);
        await this.propagateToFollowingMonths(officeId, newMonth, closingNew, session);
      }

      await session.commitTransaction();
      return updated;
    } catch (err) {
      await session.abortTransaction();
      console.error('Error updating transaction:', err);
      throw new InternalServerErrorException('Failed to update transaction');
    } finally {
      await session.endSession();
    }
  }

  // ================= DELETE =================
  async remove(id: string) {
    const session: ClientSession = await this.txnModel.db.startSession();
    await session.startTransaction();

    try {
      if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID');

      const existing = await this.txnModel.findById(id).session(session);
      if (!existing) throw new NotFoundException('Transaction not found');

      const officeId = existing.office instanceof Types.ObjectId ? existing.office : new Types.ObjectId(existing.office);
      const month = existing.month;

      if (existing.chequeImage) await this.cloudinary.deleteByUrl(existing.chequeImage).catch(() => null);

      await this.txnModel.findByIdAndDelete(id, { session });

      const prevMonth = this.getPreviousMonth(month);
      const prevSummary = await this.summaryModel.findOne({ office: officeId, month: prevMonth }).session(session);
      const opening = prevSummary?.closingBalance ?? 0;

      const closing = await this.recalculateMonthTransactions(officeId, month, opening, session);

      await this.propagateToFollowingMonths(officeId, month, closing, session);

      await session.commitTransaction();
      return existing;
    } catch (err) {
      await session.abortTransaction();
      console.error('Error deleting transaction:', err);
      throw new InternalServerErrorException('Failed to delete transaction');
    } finally {
      await session.endSession();
    }
  }

  // ================= FIND ALL =================
  async findAll(query: QueryPettycashDto) {
    try {
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.max(1, Number(query.limit ?? 1000));
      const filter: any = {};

      if (query.office) {
        if (!Types.ObjectId.isValid(query.office)) throw new BadRequestException('Invalid office ID');
        filter.office = new Types.ObjectId(query.office);
      }

      if (query.month) filter.month = query.month;

      if (query.startDate || query.endDate) {
        filter.dateOfPayment = {};
        if (query.startDate) filter.dateOfPayment.$gte = new Date(query.startDate);
        if (query.endDate) filter.dateOfPayment.$lte = new Date(query.endDate);
      }

      if (query.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [{ reference: regex }, { bankName: regex }, { description: regex }, { title: regex }];
      }

      const skip = (page - 1) * limit;

      const [data, total, summary] = await Promise.all([
        this.txnModel
          .find(filter)
          .populate('office')
          .sort({ dateOfPayment: 1, createdAt: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.txnModel.countDocuments(filter),
        query.office && query.month
          ? this.summaryModel.findOne({ office: new Types.ObjectId(query.office), month: query.month }).lean()
          : null,
      ]);

      let totalExpense = 0;
      let totalIncome = 0;
      for (const element of data) {
        totalExpense += element.debit ?? 0;
        totalIncome += element.credit ?? 0;
      }

      return {
        data,
        total,
        page,
        limit,
        summary: summary ? { ...summary, totalExpense, totalIncome } : { openingBalance: 0, closingBalance: 0, note: 'No summary found' },
      };
    } catch (err) {
      console.error('Error fetching transactions:', err);
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  // ================= FIND ONE =================
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid pettycash id');
    const txn = await this.txnModel.findById(id).populate('office').exec();
    if (!txn) throw new NotFoundException('Pettycash record not found');
    const summary = await this.summaryModel.findOne({ office: txn.office, month: txn.month }).lean();
    return { txn, summary };
  }

  // ================= RECALC & PROPAGATION HELPERS =================

  /**
   * Recalculates all transactions for a given office+month.
   * Returns the closingBalance (number).
   */
  private async recalculateMonthTransactions(
    officeId: Types.ObjectId,
    month: string,
    openingBalance: number,
    session: ClientSession,
  ): Promise<number> {
    // fetch txns sorted by dateOfPayment then createdAt
    const txns = await this.txnModel
      .find({ office: officeId, month })
      .sort({ dateOfPayment: 1, createdAt: 1 })
      .session(session);

    let balance = openingBalance;

    for (const txn of txns) {
      const debit = txn.transactionType === 'expense' ? Number(txn.amount) : 0;
      const credit = txn.transactionType === 'income' ? Number(txn.amount) : 0;
      balance = balance + credit - debit;

      // update only if changed to reduce writes
      if (txn.balanceAfter !== balance) {
        await this.txnModel.findByIdAndUpdate(txn._id, { balanceAfter: balance }, { session });
      }
    }

    // update/create summary
    let summary = await this.summaryModel.findOne({ office: officeId, month }).session(session);
    if (summary) {
      summary.openingBalance = openingBalance;
      summary.closingBalance = balance;
      await summary.save({ session });
    } else {
      await this.summaryModel.create([{ office: officeId, month, openingBalance, closingBalance: balance }], { session });
    }

    return balance;
  }

  /**
   * Propagate closing balance to following months (iterative).
   * It will keep updating next months while either txns exist or summary exists.
   */
  private async propagateToFollowingMonths(
    officeId: Types.ObjectId,
    fromMonth: string,
    fromClosingBalance: number,
    session: ClientSession,
  ) {
    let currentClosing = fromClosingBalance;
    let nextMonth = this.getNextMonth(fromMonth);

    // loop until we find a month with neither txns nor summary
    while (true) {
      const hasTxns = await this.txnModel.exists({ office: officeId, month: nextMonth }).session(session);
      const nextSummary = await this.summaryModel.findOne({ office: officeId, month: nextMonth }).session(session);

      if (!hasTxns && !nextSummary) {
        // nothing to propagate to — stop
        break;
      }

      // If summary exists but no txns, we still need to update its openingBalance and closingBalance = openingBalance
      const openingBalance = currentClosing;

      // Recalculate nextMonth transactions with this opening balance (if no txns, recalc will simply set summary)
      const closing = await this.recalculateMonthTransactions(officeId, nextMonth, openingBalance, session);

      // prepare for next iteration
      currentClosing = closing;
      nextMonth = this.getNextMonth(nextMonth);
    }
  }

  // ================= MONTH HELPERS =================
  private formatMonth(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  private getPreviousMonth(monthStr: string): string {
    const [mStr, yStr] = monthStr.split('-');
    let month = parseInt(mStr, 10);
    let year = parseInt(yStr, 10);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    return `${month.toString().padStart(2, '0')}-${year}`;
  }

  private getNextMonth(monthStr: string): string {
    const [mStr, yStr] = monthStr.split('-');
    let month = parseInt(mStr, 10);
    let year = parseInt(yStr, 10);
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
    return `${month.toString().padStart(2, '0')}-${year}`;
  }
}
