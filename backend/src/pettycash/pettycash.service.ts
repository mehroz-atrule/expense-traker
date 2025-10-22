import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, ClientSession } from 'mongoose';
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
      const month = createDto.month || this.formatMonth(new Date()); // e.g. "11-2025"

      const chequeImageUrl = chequeImage
        ? (await this.cloudinary.uploadBuffer(chequeImage.buffer, 'pettycash')).secure_url
        : undefined;

      const amount = Number(createDto.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException('Invalid transaction amount');
      }

      const isIncome = createDto.transactionType === 'income';
      const debit = isIncome ? 0 : amount;
      const credit = isIncome ? amount : 0;

      // Find last txn for this office
      let lastTxn = await this.txnModel
        .findOne({ office: officeId })
        .sort({ dateOfPayment: -1, _id: -1 })
        .session(session);

      let lastBalance = 0;

      // If this is first txn for this month → get previous month summary
      const hasTxnInMonth = await this.txnModel
        .exists({ office: officeId, month })
        .session(session);

      if (!hasTxnInMonth) {
        const prevMonth = this.getPreviousMonth(month);
        const prevSummary = await this.summaryModel
          .findOne({ office: officeId, month: prevMonth })
          .session(session);
        lastBalance = prevSummary?.closingBalance ?? 0;
      } else {
        lastBalance = lastTxn?.balanceAfter ?? 0;
      }

      const balanceAfter = isIncome ? lastBalance + amount : lastBalance - amount;

      // Create txn
      const [txn] = await this.txnModel.create(
        [
          {
            office: officeId,
            title: createDto.title,
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

      await this.updateSummary(officeId, month, balanceAfter, session);

      await session.commitTransaction();
      return txn;
    } catch (err) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create transaction');
    } finally {
      session.endSession();
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
      const amount = Number(updateDto.amount ?? txn.amount);
      const debit = transactionType === 'expense' ? amount : 0;
      const credit = transactionType === 'income' ? amount : 0;

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

      await this.recalculateFollowing(txn.office, txn.dateOfPayment, newBalance, session);

      await session.commitTransaction();
      return updatedTxn;
    } catch (err) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to update transaction');
    } finally {
      session.endSession();
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

      const previous = await this.txnModel
        .findOne({ office: txn.office, dateOfPayment: { $lt: txn.dateOfPayment } })
        .sort({ dateOfPayment: -1, _id: -1 })
        .session(session);

      const lastBalance = previous?.balanceAfter ?? 0;

      await this.recalculateFollowing(txn.office, txn.dateOfPayment, lastBalance, session);

      await session.commitTransaction();
      return txn;
    } catch (err) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to remove transaction');
    } finally {
      session.endSession();
    }
  }

  // ================= FIND ALL =================
  async findAll(query: QueryPettycashDto) {
    try {
      const page = Math.max(1, Number(query?.page ?? 1));
      const limit = Math.max(1, Number(query?.limit ?? 1000));
      const filter: FilterQuery<PettyCashTransaction> = {};

      if (query.office) {
        if (!Types.ObjectId.isValid(query.office))
          throw new BadRequestException('Invalid office id');
        filter.office = new Types.ObjectId(query.office);
      }

      if (query.month) filter.month = query.month;

      if (query.startDate || query.endDate) {
        const dateFilter: any = {};
        if (query.startDate) dateFilter.$gte = new Date(query.startDate);
        if (query.endDate) dateFilter.$lte = new Date(query.endDate);
        filter.dateOfPayment = dateFilter;
      }

      if (query.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [
          { reference: regex },
          { bankName: regex },
          { description: regex },
        ];
      }

      const skip = (page - 1) * limit;

      const [data, total, summary] = await Promise.all([
        this.txnModel
          .find(filter)
          .populate('office')
          .sort({ dateOfPayment: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.txnModel.countDocuments(filter),
        query.office && query.month
          ? this.summaryModel
            .findOne({
              office: new Types.ObjectId(query.office),
              month: query.month,
            })
            .populate('office')
            .lean()
          : null,
      ]);

      return {
        data,
        total,
        page,
        limit,
        summary:
          summary || {
            openingBalance: 0,
            closingBalance: 0,
            note: 'No summary found for this office/month',
          },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  // ================= HELPERS =================

  private async updateSummary(
    office: Types.ObjectId,
    month: string,
    closingBalance: number,
    session?: ClientSession,
  ) {
    let summary = await this.summaryModel.findOne({ office, month }).session(session);
    if (summary) {
      summary.closingBalance = closingBalance;
      await summary.save({ session });
    } else {
      const prevMonth = this.getPreviousMonth(month);
      const prevSummary = await this.summaryModel
        .findOne({ office, month: prevMonth })
        .session(session);
      const openingBalance = prevSummary?.closingBalance ?? 0;
      await this.summaryModel.create(
        [{ office, month, openingBalance, closingBalance }],
        { session },
      );
    }
  }

  private async recalculateFollowing(
    office: Types.ObjectId,
    fromDate: Date,
    startingBalance: number,
    session?: ClientSession,
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

      await this.updateSummary(txn.office, txn.month, newBalance, session);
    }
  }

  // ================= MONTH HELPERS =================

  // Return formatted month "MM-YYYY"
  private formatMonth(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${year}`;
  }

  // Given "MM-YYYY" → returns previous month as "MM-YYYY"
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
}
