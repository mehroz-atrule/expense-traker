import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OfficeService } from './office.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/roles.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Offices')
@ApiBearerAuth()
@Controller('office')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfficeController {
  constructor(private readonly officeService: OfficeService) { }

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new office' })
  @ApiResponse({ status: 201, description: 'Office created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Office with this name already exists',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOfficeDto: CreateOfficeDto) {
    return this.officeService.create(createOfficeDto);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all offices' })
  @ApiResponse({ status: 200, description: 'List of all offices' })
  findAll() {
    return this.officeService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get office by ID' })
  @ApiResponse({ status: 200, description: 'Office details' })
  @ApiResponse({ status: 404, description: 'Office not found' })
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update office' })
  @ApiResponse({ status: 200, description: 'Office updated successfully' })
  @ApiResponse({ status: 404, description: 'Office not found' })
  @ApiResponse({
    status: 409,
    description: 'Office with this name already exists',
  })
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officeService.update(id, updateOfficeDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete office' })
  @ApiResponse({ status: 200, description: 'Office deleted successfully' })
  @ApiResponse({ status: 404, description: 'Office not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.officeService.remove(id);
  }
}
