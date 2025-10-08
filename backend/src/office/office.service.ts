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

@Injectable()
export class OfficeService {
  private readonly logger = new Logger(OfficeService.name);

  constructor(@InjectModel(Office.name) private officeModel: Model<Office>) { }

  async create(createOfficeDto: CreateOfficeDto): Promise<Office> {
    try {
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
    } catch (error) {
      this.logger.error('Error creating office', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to create office');
    }
  }

  async findAll(): Promise<Office[]> {
    try {
      this.logger.log('Fetching all offices');
      const offices = await this.officeModel.find({ isActive: true }).exec();
      this.logger.log(`Found ${offices.length} offices`);
      return offices;
    } catch (error) {
      this.logger.error('Error fetching offices', error);
      throw new Error('Failed to fetch offices');
    }
  }

  async findOne(id: string): Promise<Office> {
    try {
      this.logger.log('Fetching office', { officeId: id });
      const office = await this.officeModel.findById(id).exec();

      if (!office) {
        throw new NotFoundException('Office not found');
      }

      return office;
    } catch (error) {
      this.logger.error('Error fetching office', error, { officeId: id });
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to fetch office');
    }
  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto): Promise<Office> {
    try {
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
    } catch (error) {
      this.logger.error('Error updating office', error, { officeId: id });
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('Failed to update office');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      this.logger.log('Deleting office', { officeId: id });

      const office = await this.officeModel.findById(id);
      if (!office) {
        throw new NotFoundException('Office not found');
      }

      // Soft delete by setting isActive to false
      await this.officeModel.findByIdAndDelete(id);

      this.logger.log('Office deleted successfully', { officeId: id });
      return { message: 'Office deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting office', error, { officeId: id });
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to delete office');
    }
  }
}
