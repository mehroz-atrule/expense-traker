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
  async create(createPettycashDto: CreatePettycashDto, chequeImage: any) {
    try {
      const pettycashUrl = chequeImage?.buffer
        ? (await this.cloudinary.uploadBuffer(chequeImage.buffer, 'pettycash')).secure_url
        : undefined;
      const pettycash = new this.pettycashModel({
        ...createPettycashDto,
        chequeImage: pettycashUrl,
      });
      return pettycash.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create pettycash');
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
        ];
      }

      // 🔹 Pagination
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.pettycashModel
          .find(filter)
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

  async update(id: string, updatePettycashDto: UpdatePettycashDto, image: any) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid prettycash id');
      }
      const pettycash = await this.pettycashModel.findById(id).exec();
      if (!pettycash) {
        throw new NotFoundException('prettycash not found');
      }
      if (pettycash.chequeImage) await this.cloudinary.deleteByUrl(pettycash.chequeImage).catch(() => undefined);
      const pettycashUrl = image?.buffer
        ? (await this.cloudinary.uploadBuffer(image.buffer, 'pettycash')).secure_url
        : undefined;
      const updatedPettycash = await this.pettycashModel.findByIdAndUpdate(id, {
        ...updatePettycashDto,
        chequeImage: pettycashUrl,
      });

      return updatedPettycash;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update prettycash');
    }
  }

  async remove(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid prettycash id');
      }
      const pettycash = await this.pettycashModel.findByIdAndDelete(id).exec();
      if (!pettycash) {
        throw new NotFoundException('prettycash not found');
      }
      return pettycash;
    } catch (error) {
      throw error;
    }
  }
}

