import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePettycashDto } from './dto/create-pettycash.dto';
import { UpdatePettycashDto } from './dto/update-pettycash.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pettycash } from './schemas/pettycash.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import { CloudinaryService } from 'src/upload/cloudinary.service';
import { QueryPettycashDto } from './dto/query-pettycash.dto';

@Injectable()
export class PettycashService {
  constructor(
    @InjectModel(Pettycash.name) private pettycashModel: Model<Pettycash>,
    private readonly cloudinary: CloudinaryService,
  ) { }
  async create(createPettycashDto: CreatePettycashDto, chequeImage?: any) {
    try {
      // 🔹 Upload image if provided
      const pettycashUrl = chequeImage?.buffer
        ? (await this.cloudinary.uploadBuffer(chequeImage.buffer, 'pettycash')).secure_url
        : undefined;

      // 🔹 Parse amounts safely
      const amountRecieve = Number(createPettycashDto.amountRecieve) || 0;
      const amountSpent = Number(createPettycashDto.amountSpent) || 0;

      const officeId = new Types.ObjectId(createPettycashDto.office);

      // 🔹 Get last pettycash for this specific office only
      const lastPettycash = await this.pettycashModel
        .findOne({ office: officeId })
        .sort({ dateOfPayment: -1 }) // last transaction by payment date
        .exec();

      // 🔹 Determine opening balance (0 if first transaction for office)
      const openingBalance = lastPettycash?.closingBalance
        ? Number(lastPettycash.closingBalance)
        : 0;

      // 🔹 Compute new closing balance
      const closingBalance = openingBalance + amountRecieve - amountSpent;

      // 🔹 Create pettycash entry
      const pettycash = new this.pettycashModel({
        ...createPettycashDto,
        office: officeId,
        chequeImage: pettycashUrl,
        openingBalance: openingBalance.toString(),
        closingBalance: closingBalance.toString(),
        remainingAmount: closingBalance.toString(),
      });

      const saved = await pettycash.save();

      // 🔹 Optional: log the operation for debugging
      console.log(
        `Pettycash created for office ${officeId}: +${amountRecieve} -${amountSpent} → Closing ${closingBalance}`
      );

      return saved;
    } catch (error) {
      console.error('Error creating pettycash:', error);
      throw new InternalServerErrorException('Failed to create pettycash record');
    }
  }



  async findAll(query: QueryPettycashDto) {
    try {
      const page = Math.max(1, Number(query?.page ?? 1));
      const limit = Math.max(1, Number(query?.limit ?? 10));
      const filter: FilterQuery<Pettycash> = {};

      // 🔹 Office filter
      if (query?.office) {
        if (!Types.ObjectId.isValid(query.office)) {
          throw new BadRequestException('Invalid office id');
        }
        filter.office = new Types.ObjectId(query.office);
      }

      // 🔹 Month filter (assuming it's stored as string like "2025-10" or "October")
      if (query?.month) {
        filter.month = query.month;
      }

      // 🔹 Date range filter (billDate)
      if (query?.startDate || query?.endDate) {
        const dateFilter: Record<string, Date> = {};
        if (query.startDate) dateFilter.$gte = new Date(query.startDate);
        if (query.endDate) dateFilter.$lte = new Date(query.endDate);
        filter.dateOfPayment = dateFilter;
      }

      // 🔹 Text search across multiple string fields
      if (query?.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [
          { chequeNumber: regex },
          { bankName: regex },
          { title: regex },
        ];
      }

      // 🔹 Pagination
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.pettycashModel
          .find(filter).populate('office')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.pettycashModel.countDocuments(filter).exec(),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch pettycash records');
    }
  }


  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense id');
      }
      const expense = await this.pettycashModel.findById(id).exec();
      if (!expense) {
        throw new NotFoundException('Expense not found');
      }
      return expense;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch expense');
    }
  }

  async update(id: string, updatePettycashDto: UpdatePettycashDto, image?: any) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid pettycash id');
      }

      const pettycash = await this.pettycashModel.findById(id).exec();
      if (!pettycash) {
        throw new NotFoundException('Pettycash not found');
      }

      // Delete old cheque image if new one is uploaded
      if (pettycash.chequeImage && image?.buffer) {
        await this.cloudinary.deleteByUrl(pettycash.chequeImage).catch(() => undefined);
      }

      const pettycashUrl = image?.buffer
        ? (await this.cloudinary.uploadBuffer(image.buffer, 'pettycash')).secure_url
        : pettycash.chequeImage;

      // Parse amounts
      const amountRecieve = Number(updatePettycashDto.amountRecieve ?? pettycash.amountRecieve ?? 0);
      const amountSpent = Number(updatePettycashDto.amountSpent ?? pettycash.amountSpent ?? 0);

      // Get the previous pettycash (ordered by dateOfPayment)
      const previous = await this.pettycashModel
        .findOne({
          office: pettycash.office,
          dateOfPayment: { $lt: pettycash.dateOfPayment },
        })
        .sort({ dateOfPayment: -1 })
        .exec();

      const openingBalance = previous?.closingBalance ? Number(previous.closingBalance) : 0;
      const closingBalance = openingBalance + amountRecieve - amountSpent;
      const remainingAmount = closingBalance;

      // Update the target pettycash
      const updatedPettycash = await this.pettycashModel.findByIdAndUpdate(
        id,
        {
          ...updatePettycashDto,
          openingBalance: openingBalance.toString(),
          closingBalance: closingBalance.toString(),
          remainingAmount: remainingAmount.toString(),
          chequeImage: pettycashUrl,
        },
        { new: true },
      );

      // 🔹 Update all following pettycash records for this office
      const following = await this.pettycashModel
        .find({
          office: pettycash.office,
          dateOfPayment: { $gt: pettycash.dateOfPayment },
        })
        .sort({ dateOfPayment: 1 })
        .exec();

      let lastClosing = closingBalance;
      for (const doc of following) {
        const recv = Number(doc.amountRecieve ?? 0);
        const spent = Number(doc.amountSpent ?? 0);
        const newClosing = lastClosing + recv - spent;

        await this.pettycashModel.findByIdAndUpdate(doc._id, {
          openingBalance: lastClosing.toString(),
          closingBalance: newClosing.toString(),
          remainingAmount: newClosing.toString(),
        });

        lastClosing = newClosing;
      }

      return updatedPettycash;
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update pettycash');
    }
  }

  async remove(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid pettycash id');
      }

      // Find the pettycash to remove
      const pettycash = await this.pettycashModel.findById(id).exec();
      if (!pettycash) {
        throw new NotFoundException('Pettycash not found');
      }

      // Delete cheque image if exists
      if (pettycash.chequeImage) {
        await this.cloudinary.deleteByUrl(pettycash.chequeImage).catch(() => undefined);
      }

      // Delete the pettycash document
      await this.pettycashModel.findByIdAndDelete(id).exec();

      // Recalculate balances for following records of the same office
      const following = await this.pettycashModel
        .find({
          office: pettycash.office,
          dateOfPayment: { $gt: pettycash.dateOfPayment },
        })
        .sort({ dateOfPayment: 1 })
        .exec();

      // Get previous closing balance
      const previous = await this.pettycashModel
        .findOne({
          office: pettycash.office,
          dateOfPayment: { $lt: pettycash.dateOfPayment },
        })
        .sort({ dateOfPayment: -1 })
        .exec();

      let lastClosing = previous?.closingBalance ? Number(previous.closingBalance) : 0;

      for (const doc of following) {
        const recv = Number(doc.amountRecieve ?? 0);
        const spent = Number(doc.amountSpent ?? 0);
        const newClosing = lastClosing + recv - spent;

        await this.pettycashModel.findByIdAndUpdate(doc._id, {
          openingBalance: lastClosing.toString(),
          closingBalance: newClosing.toString(),
          remainingAmount: newClosing.toString(),
        });

        lastClosing = newClosing;
      }

      return pettycash;
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete pettycash');
    }
  }

}

