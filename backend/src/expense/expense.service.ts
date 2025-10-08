import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  findAll() {
    return this.expenseModel.find().exec();
  }

  findOne(id: number) {
    return this.expenseModel.findById(id).exec();
  }

  update(id: number, updateExpenseDto: UpdateExpenseDto) {
    return this.expenseModel.findByIdAndUpdate(id, updateExpenseDto, { new: true }).exec();
  }

  remove(id: number) {
    return this.expenseModel.findByIdAndDelete(id).exec();
  }
}
