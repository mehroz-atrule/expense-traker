import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
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

      const chequeImageUrl = chequeImage
        ? (await this.cloudinary.uploadBuffer(chequeImage.buffer, 'pettycash')).secure_url
        : undefined;

      const amount = Number(createDto.amount);
      if (isNaN(amount) || amount <= 0)
        throw new BadRequestException('Invalid transaction amount');

      const isIncome = createDto.transactionType === 'income';
      const debit = isIncome ? 0 : amount;
      const credit = isIncome ? amount : 0;

      // Determine starting balance for month
      let openingBalance = 0;
      const prevMonth = this.getPreviousMonth(month);
      const prevSummary = await this.summaryModel.findOne({ office: officeId, month: prevMonth }).session(session);
      openingBalance = prevSummary?.closingBalance ?? 0;

      // Get all transactions for the month to recalc after inserting
      const txnData = {
        office: officeId,
        title: createDto.title,
        transactionType: createDto.transactionType,
        amount,
        debit,
        credit,
        balanceAfter: 0, // temporary, will recalc
        description: createDto.description ?? '',
        reference: createDto.transactionNo ?? createDto.chequeNumber ?? '',
        bankName: createDto.bankName ?? '',
        chequeImage: chequeImageUrl,
        month,
        dateOfPayment: new Date(createDto.dateOfPayment ?? Date.now()),
      };

      const txn = await this.txnModel.create([txnData], { session });
      // Recalculate balances for month after adding new txn
      await this.recalculateMonthTransactions(officeId, month, openingBalance, session);

      await session.commitTransaction();
      return txn[0];
    } catch (err) {
      await session.abortTransaction();
      console.error('Error creating transaction:', err);
      throw new InternalServerErrorException('Failed to create transaction');
    } finally {
      session.endSession();
    }
  }

  // ================= UPDATE =================
  async update(id: string, updateDto: UpdatePettycashDto, image?: any) {
    const session: ClientSession = await this.txnModel.db.startSession();
    await session.startTransaction();

    try {
      console.log('Updating transaction:', updateDto);
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException('Invalid transaction ID');

      const txn = await this.txnModel.findById(id).session(session);
      if (!txn) throw new NotFoundException('Transaction not found');

      let chequeImageUrl = txn.chequeImage;
      if (image?.buffer) {
        if (chequeImageUrl) await this.cloudinary.deleteByUrl(chequeImageUrl).catch(() => null);
        chequeImageUrl = (await this.cloudinary.uploadBuffer(image.buffer, 'pettycash')).secure_url;
      }
      const isIncome = updateDto.transactionType === 'income';
      const debit = isIncome ? 0 : updateDto.amount;
      const credit = isIncome ? updateDto.amount : 0;
      const officeId = txn.office instanceof Types.ObjectId ? txn.office : new Types.ObjectId(txn.office);

      await this.txnModel.findByIdAndUpdate(
        id,
        { ...updateDto, office: officeId, chequeImage: chequeImageUrl, debit, credit },
        { new: true, session },
      );

      // Recalculate month transactions
      const month = txn.month;
      const prevMonth = this.getPreviousMonth(month);
      const prevSummary = await this.summaryModel.findOne({ office: officeId, month: prevMonth }).session(session);
      const openingBalance = prevSummary?.closingBalance ?? 0;

      await this.recalculateMonthTransactions(officeId, month, openingBalance, session);

      await session.commitTransaction();
      return await this.txnModel.findById(id).session(session);
    } catch (err) {
      await session.abortTransaction();
      console.error('Error updating transaction:', err);
      throw new InternalServerErrorException('Failed to update transaction');
    } finally {
      session.endSession();
    }
  }

  // ================= DELETE =================
  async remove(id: string) {
    const session: ClientSession = await this.txnModel.db.startSession();
    await session.startTransaction();

    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException('Invalid transaction ID');

      const txn = await this.txnModel.findById(id).session(session);
      if (!txn) throw new NotFoundException('Transaction not found');

      if (txn.chequeImage) await this.cloudinary.deleteByUrl(txn.chequeImage).catch(() => null);

      const officeId = txn.office instanceof Types.ObjectId ? txn.office : new Types.ObjectId(txn.office);
      const month = txn.month;

      await this.txnModel.findByIdAndDelete(id, { session });

      const prevMonth = this.getPreviousMonth(month);
      const prevSummary = await this.summaryModel.findOne({ office: officeId, month: prevMonth }).session(session);
      const openingBalance = prevSummary?.closingBalance ?? 0;

      await this.recalculateMonthTransactions(officeId, month, openingBalance, session);

      await session.commitTransaction();
      return txn;
    } catch (err) {
      await session.abortTransaction();
      console.error('Error deleting transaction:', err);
      throw new InternalServerErrorException('Failed to delete transaction');
    } finally {
      session.endSession();
    }
  }

  // ================= FIND ALL =================
  async findAll(query: QueryPettycashDto) {
    try {
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.max(1, Number(query.limit ?? 1000));
      const filter: any = {};

      if (query.office) {
        if (!Types.ObjectId.isValid(query.office))
          throw new BadRequestException('Invalid office ID');
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
        filter.$or = [{ reference: regex }, { bankName: regex }, { description: regex }];
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

      return {
        data,
        total,
        page,
        limit,
        summary: summary ?? { openingBalance: 0, closingBalance: 0, note: 'No summary found' },
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

  // ================= RECALC FOR MONTH =================
  private async recalculateMonthTransactions(
    officeId: Types.ObjectId,
    month: string,
    openingBalance: number,
    session: ClientSession,
  ) {
    const txns = await this.txnModel
      .find({ office: officeId, month })
      .sort({ dateOfPayment: 1, createdAt: 1 })
      .session(session);

    let balance = openingBalance;

    for (const txn of txns) {
      const debit = txn.transactionType === 'expense' ? txn.amount : 0;
      const credit = txn.transactionType === 'income' ? txn.amount : 0;
      balance = balance + credit - debit;

      await this.txnModel.findByIdAndUpdate(txn._id, { balanceAfter: balance }, { session });
    }

    // Update summary closing balance
    let summary = await this.summaryModel.findOne({ office: officeId, month }).session(session);
    if (summary) {
      summary.closingBalance = balance;
      await summary.save({ session });
    } else {
      await this.summaryModel.create([{ office: officeId, month, openingBalance, closingBalance: balance }], { session });
    }
  }

  // ================= HELPERS =================
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
}
