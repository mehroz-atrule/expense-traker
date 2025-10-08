import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateExpenseDto, Status } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { CloudinaryService } from '../upload/cloudinary.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async create(createExpenseDto: CreateExpenseDto, image?: any) {
    try {
      const amountNumber = Number(createExpenseDto.amount);
      if (Number.isNaN(amountNumber)) {
        throw new BadRequestException('Amount must be a number');
      }
      if (!Types.ObjectId.isValid(createExpenseDto.office)) {
        throw new BadRequestException('Invalid office id');
      }
      if (!createExpenseDto.date || Number.isNaN(Date.parse(createExpenseDto.date))) {
        throw new BadRequestException('Invalid expense date');
      }

      const receiptUrl = image?.buffer
        ? (await this.cloudinary.uploadBuffer(image.buffer, 'expenses')).secure_url
        : undefined;

      const expense = new this.expenseModel({
        title: createExpenseDto.title,
        vendor: createExpenseDto.vendor,
        amount: amountNumber,
        category: createExpenseDto.category,
        officeId: new Types.ObjectId(createExpenseDto.office),
        paymentMethod: createExpenseDto.payment,
        description: createExpenseDto.description,
        receiptUrl,
        expenseDate: new Date(createExpenseDto.date),
        status: Status.New
      });

      return await expense.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create expense');
    }
  }

  async findAll(query?: any) {
    try {
      const page = Math.max(1, Number(query?.page ?? 1));
      const limit = Math.max(1, Number(query?.limit ?? 10));
      const filter: FilterQuery<Expense> = {} as any;

      if (query?.office) {
        if (!Types.ObjectId.isValid(query.office)) {
          throw new BadRequestException('Invalid office id');
        }
        filter.officeId = new Types.ObjectId(query.office);
      }
      if (query?.vendor) {
        filter.vendor = query.vendor;
      }
      if (query?.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [
          { title: regex },
          { category: regex },
          { description: regex },
          { vendor: regex },
        ];
      }

      const [data, total] = await Promise.all([
        this.expenseModel
          .find(filter)
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.expenseModel.countDocuments(filter).exec(),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
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

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid expense id');
      }
      if (updateExpenseDto['office'] && !Types.ObjectId.isValid(updateExpenseDto['office'] as any)) {
        throw new BadRequestException('Invalid office id');
      }
      if (updateExpenseDto['amount'] && Number.isNaN(Number(updateExpenseDto['amount'] as any))) {
        throw new BadRequestException('Amount must be a number');
      }

      const updated = await this.expenseModel.findByIdAndUpdate(id, updateExpenseDto, { new: true, runValidators: true }).exec();
      if (!updated) {
        throw new NotFoundException('Expense not found');
      }
      return updated;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
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
