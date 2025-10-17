import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { PettycashService } from './pettycash.service';
import { CreatePettycashDto } from './dto/create-pettycash.dto';
import { UpdatePettycashDto } from './dto/update-pettycash.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { QueryPettycashDto } from './dto/query-pettycash.dto';

@Controller('pettycash')
export class PettycashController {
  constructor(private readonly pettycashService: PettycashService) { }

  @Post()
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))

  create(@Body() createPettycashDto: CreatePettycashDto, @UploadedFiles() files: Array<any>,) {
    const safeFiles = Array.isArray(files) ? files : [];
    const image = safeFiles.find(f => f.fieldname === 'chequeImage');
    return this.pettycashService.create(createPettycashDto, image);
  }

  @Get()
  findAll(@Query() query: QueryPettycashDto) {
    return this.pettycashService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pettycashService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  update(@Param('id') id: string, @Body() updatePettycashDto: UpdatePettycashDto, @UploadedFiles() files: Array<any>,) {
    const safeFiles = Array.isArray(files) ? files : [];
    const image = safeFiles.find(f => f.fieldname === 'chequeImage');
    return this.pettycashService.update(id, updatePettycashDto, image);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pettycashService.remove(id);
  }
}
