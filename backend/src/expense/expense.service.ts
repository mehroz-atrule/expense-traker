import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
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
    const receiptUrl = image?.buffer
      ? (await this.cloudinary.uploadBuffer(image.buffer, 'expenses')).secure_url
      : undefined;

    const amountNumber = Number(createExpenseDto.amount);
    if (Number.isNaN(amountNumber)) {
      throw new BadRequestException('Amount must be a number');
    }

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
    });

    return expense.save();
  }

  async findAll(query?: any) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 10);
    const filter: FilterQuery<Expense> = {} as any;

    if (query?.office) {
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
  }

  findOne(id: number) {
    return this.expenseModel.findById(id).exec();
  }

  update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return this.expenseModel.findByIdAndUpdate(id, updateExpenseDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.expenseModel.findByIdAndDelete(id).exec();
  }
}
