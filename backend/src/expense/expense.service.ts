import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateExpenseDto, Status } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { CloudinaryService } from '../upload/cloudinary.service';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async create(createExpenseDto: CreateExpenseDto, image?: any, chequeImage?: any, paymentSlip?: any) {
    try {
      const amountNumber = Number(createExpenseDto.amount);
      if (Number.isNaN(amountNumber)) {
        throw new BadRequestException('Amount must be a number');
      }
      if (typeof (createExpenseDto.advanceTax) === 'string') {
        createExpenseDto.advanceTax = Number(createExpenseDto.advanceTax);
      }
      if (!Types.ObjectId.isValid(createExpenseDto.office)) {
        throw new BadRequestException('Invalid office id');
      }


      const receiptUrl = image?.buffer
        ? (await this.cloudinary.uploadBuffer(image.buffer, 'expenses')).secure_url
        : undefined;

      const expense = new this.expenseModel({
        title: createExpenseDto.title,
        vendor: createExpenseDto.vendor,
        amount: amountNumber,
        category: createExpenseDto.category,
        office: new Types.ObjectId(createExpenseDto.office),
        payment: createExpenseDto.payment,
        description: createExpenseDto.description,
        image: receiptUrl,
        billDate: new Date(createExpenseDto.billDate),
        dueDate: new Date(createExpenseDto.dueDate),
        paymentDate: createExpenseDto.paymentDate
          ? new Date(createExpenseDto.paymentDate)
          : null,
        WHT: createExpenseDto.WHT ?? 0,
        advanceTax: createExpenseDto.advanceTax ?? 0,
        amountAfterTax: amountNumber,
        status: Status.WaitingForApproval,
        chequeImage: chequeImage,
        paymentSlip: paymentSlip,
      });

      return await expense.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create expense');
    }
  }

  async findAll(query?: QueryExpenseDto) {
    try {
      const page = Math.max(1, Number(query?.page ?? 1));
      const limit = Math.max(1, Number(query?.limit ?? 10));
      const filter: FilterQuery<Expense> = {};

      // 🔹 Office filter
      if (query?.office) {
        if (!Types.ObjectId.isValid(query.office)) {
          throw new BadRequestException('Invalid office id');
        }
        filter.office = new Types.ObjectId(query.office);
      }

      // 🔹 Vendor filter
      if (query?.vendor) {
        filter.vendor = query.vendor;
      }

      // 🔹 Category filter
      if (query?.category) {
        filter.category = query.category;
      }

      // 🔹 Status filter
      if (query?.status) {
        filter.status = query.status;
      }

      // 🔹 Date range filter (on billDate)
      if (query?.startDate || query?.endDate) {
        const dateFilter: any = {};
        if (query.startDate) dateFilter.$gte = new Date(query.startDate);
        if (query.endDate) dateFilter.$lte = new Date(query.endDate);
        filter.billDate = dateFilter;
      }

      // 🔹 Text search — merge instead of overwriting
      if (query?.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [
          { title: regex },
          { category: regex },
          { description: regex },
          { status: regex },
        ];
      }

      // 🔹 Pagination & Fetch
      const [data, total] = await Promise.all([
        this.expenseModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.expenseModel.countDocuments(filter).exec(),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch expenses');
    }
  }


  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense id');
      }
      const expense = await this.expenseModel.findById(id).exec();
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

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    image?: any,
    chequeImage?: any,
    paymentSlip?: any,

  ) {
    try {
      if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid expense id');

      const existing = await this.expenseModel.findById(id).exec();
      if (!existing) throw new NotFoundException('Expense not found');

      const updatePayload: Record<string, any> = { ...updateExpenseDto };

      // Status validation
      if (updatePayload.status && !Object.values(Status).includes(updatePayload.status)) {
        throw new BadRequestException('Invalid status value');
      }

      // Handle optional image files
      if (image?.buffer) {
        if (existing.image) await this.cloudinary.deleteByUrl(existing.image).catch(() => undefined);
        const uploaded = await this.cloudinary.uploadBuffer(image.buffer, 'expenses');
        updatePayload.image = uploaded.secure_url;
      }

      if (chequeImage?.buffer) {
        if (existing.chequeImage) await this.cloudinary.deleteByUrl(existing.chequeImage).catch(() => undefined);
        const uploaded = await this.cloudinary.uploadBuffer(chequeImage.buffer, 'expenses');
        updatePayload.chequeImage = uploaded.secure_url;
      }

      if (paymentSlip?.buffer) {
        if (existing.paymentSlip) await this.cloudinary.deleteByUrl(existing.paymentSlip).catch(() => undefined);
        const uploaded = await this.cloudinary.uploadBuffer(paymentSlip.buffer, 'expenses');
        updatePayload.paymentSlip = uploaded.secure_url;
      }

      // Normalize and validate fields
      if (updatePayload.amount !== undefined) {
        const amountNumber = Number(updatePayload.amount);
        if (Number.isNaN(amountNumber)) {
          throw new BadRequestException('Amount must be a number');
        }
        updatePayload.amount = amountNumber;
      }

      if (updatePayload.office) {
        if (!Types.ObjectId.isValid(updatePayload.office)) {
          throw new BadRequestException('Invalid office id');
        }
        updatePayload.office = new Types.ObjectId(updatePayload.office);
      }

      // Coerce WHT and advanceTax if present
      if (updatePayload.WHT !== undefined) {
        const whtNumber = Number(updatePayload.WHT);
        if (Number.isNaN(whtNumber)) {
          throw new BadRequestException('WHT must be a number');
        }
        updatePayload.WHT = whtNumber;
      }

      if (updatePayload.advanceTax !== undefined) {
        const advNumber = updatePayload.advanceTax;
        if (Number.isNaN(advNumber)) {
          throw new BadRequestException('advanceTax must be a number');
        }
        updatePayload.advanceTax = advNumber;
      }

      const updated = await this.expenseModel
        .findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true })
        .exec();

      if (!updated) throw new NotFoundException('Expense not found');
      return updated;

    } catch (error) {
      console.error('UPDATE EXPENSE ERROR:', error); // Log actual error
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update expense');
    }
  }


  async remove(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense id');
      }
      const deleted = await this.expenseModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new NotFoundException('Expense not found');
      }
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete expense');
    }
  }


}
