import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/types/roles.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('expense')
// @UseGuards(RolesGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  // @Roles(Role.Submitter, Role.Admin)
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFile() image?: any,
  ) {
    return this.expenseService.create(createExpenseDto, image);
  }

  @Get()
  // @Roles(Role.Admin)
  async findAll() {
    try {
      console.log('Fetching expenses...');
      return this.expenseService.findAll();
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw new InternalServerErrorException('Could not retrieve expenses');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(+id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(+id);
  }
}
