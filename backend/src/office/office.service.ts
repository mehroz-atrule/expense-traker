import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Office } from './schemas/office.schema';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { Expense } from '../expense/schemas/expense.schema';
import { PettyCashTransaction } from '../pettycash/schemas/pettycash.schema';
import { PettyCashSummary, PettyCashSummaryDocument } from '../pettycash/schemas/pettycashsummary.schema';

@Injectable()
export class OfficeService {
  private readonly logger = new Logger(OfficeService.name);

  constructor(
    @InjectModel(Office.name) private officeModel: Model<Office>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(PettyCashTransaction.name) private pettyCashModel: Model<PettyCashTransaction>,
    @InjectModel(PettyCashSummary.name)
    private readonly summaryModel: Model<PettyCashSummaryDocument>,

  ) { }

  async create(createOfficeDto: CreateOfficeDto): Promise<Office> {

    this.logger.log('Creating new office', { name: createOfficeDto.name });

    // Check if office with same name already exists
    const existingOffice = await this.officeModel.findOne({
      name: createOfficeDto.name,
    });

    if (existingOffice) {
      throw new ConflictException('Office with this name already exists');
    }

    const office = new this.officeModel(createOfficeDto);
    const savedOffice = await office.save();

    this.logger.log('Office created successfully', {
      officeId: savedOffice._id,
    });
    return savedOffice;

  }

  async findAll(): Promise<Office[]> {

    this.logger.log('Fetching all offices');
    const offices = await this.officeModel.find().exec();
    this.logger.log(`Found ${offices.length} offices`);
    return offices;

  }

  async findOne(id: string): Promise<Office> {

    this.logger.log('Fetching office', { officeId: id });
    const office = await this.officeModel.findById(id).exec();

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    return office;

  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto): Promise<Office> {

    this.logger.log('Updating office', { officeId: id });

    // Check if office exists
    const existingOffice = await this.officeModel.findById(id);
    if (!existingOffice) {
      throw new NotFoundException('Office not found');
    }

    // If updating name, check for conflicts
    if (
      updateOfficeDto.name &&
      updateOfficeDto.name !== existingOffice.name
    ) {
      const nameConflict = await this.officeModel.findOne({
        name: updateOfficeDto.name,
        _id: { $ne: id },
      });

      if (nameConflict) {
        throw new ConflictException('Office with this name already exists');
      }
    }

    const updatedOffice = await this.officeModel
      .findByIdAndUpdate(id, updateOfficeDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedOffice) {
      throw new NotFoundException('Office not found');
    }

    this.logger.log('Office updated successfully', { officeId: id });
    return updatedOffice;


  }

  async remove(id: string): Promise<{ message: string }> {
    console.log("start delete office");
    this.logger.log('Deleting office', { officeId: id });

    const office = await this.officeModel.findById(id);
    if (!office) {
      throw new NotFoundException('Office not found');
    }

    try {
      // Start a session for transaction
      const session = await this.officeModel.db.startSession();
      console.log("session started");
      await session.withTransaction(async () => {
        // Delete all related expenses
        await this.expenseModel.deleteMany({ office: id }).session(session);
        this.logger.log('Deleted related expenses', { officeId: id });
        console.log("deleted expenses");
        // Delete all related petty cash transactions
        await this.pettyCashModel.deleteMany({ office: id }).session(session);
        console.log("deleted petty cash transactions");
        this.logger.log('Deleted related petty cash transactions', { officeId: id });
        await this.summaryModel.deleteMany({ office: id }).session(session);
        console.log("deleted petty cash summaries");

        this.logger.log('Deleted related petty cash summaries', { officeId: id });
        // Finally delete the office
        await this.officeModel.findByIdAndDelete(id).session(session);
        console.log("office deleted");
        this.logger.log('Office deleted', { officeId: id });
      });
      await session.endSession();
    } catch (error) {
      this.logger.error('Error during office deletion', {
        officeId: id,
        error: error.message
      });
      throw new Error(`Failed to delete office and related data: ${error.message}`);
    }

    this.logger.log('Office deleted successfully', { officeId: id });
    return { message: 'Office deleted successfully' };

  }
}
