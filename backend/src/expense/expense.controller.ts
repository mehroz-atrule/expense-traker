import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) { }

  @Post()
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFiles() files: Array<any>,
  ) {
    const safeFiles = Array.isArray(files) ? files : [];
    const image = safeFiles.find(f => f.fieldname === 'image');
    const chequeImage = safeFiles.find(f => f.fieldname === 'chequeImage');
    const paymentSlip = safeFiles.find(f => f.fieldname === 'paymentSlip');
    return this.expenseService.create(createExpenseDto, image, chequeImage, paymentSlip);
  }

  @Get()
  findAll(@Query() query: QueryExpenseDto) {
    return this.expenseService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @UploadedFiles() files: Array<any>,
  ) {
    const safeFiles = Array.isArray(files) ? files : [];
    const image = safeFiles.find(f => f.fieldname === 'image');
    const chequeImage = safeFiles.find(f => f.fieldname === 'chequeImage');
    const paymentSlip = safeFiles.find(f => f.fieldname === 'paymentSlip');

    return this.expenseService.update(id, updateExpenseDto, image, chequeImage, paymentSlip);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
