import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Vendor } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';

@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<Vendor>) { }

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const dup = await this.vendorModel.findOne({
      vendorName: createVendorDto.vendorName,
      vendorIban: createVendorDto.vendorIban,
    });
    if (dup) {
      throw new ConflictException('Vendor with same name/IBAN already exists');
    }
    const vendor = new this.vendorModel(createVendorDto);
    return vendor.save();
  }

  async findAll(
    query: QueryVendorDto,
  ): Promise<{ data: Vendor[]; total: number; page: number; limit: number }> {
    const { q, customerId } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filter: FilterQuery<Vendor> = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { vendorName: regex },
        { location: regex },
        { vendorAccountTitle: regex },
        { preferredBankName: regex },
        { vendorIban: regex },
      ];
    }

    const [data, total] = await Promise.all([
      this.vendorModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.vendorModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorModel.findById(id).exec();
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const updated = await this.vendorModel
      .findByIdAndUpdate(id, updateVendorDto, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!updated) throw new NotFoundException('Vendor not found');
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.vendorModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Vendor not found');
    return { message: 'Vendor deleted successfully' };
  }
}
