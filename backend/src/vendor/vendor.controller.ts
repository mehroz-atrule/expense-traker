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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/roles.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Query } from '@nestjs/common';
import { QueryVendorDto } from './dto/query-vendor.dto';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('vendor')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) { }

  @Post()
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.create(createVendorDto);
  }

  @Get()
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all vendors (searchable)' })
  @ApiResponse({ status: 200, description: 'List of all vendors' })
  findAll(@Query() query: QueryVendorDto) {
    return this.vendorService.findAll(query);
  }

  @Get(':id')
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Patch(':id')
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Delete(':id')
  // @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.vendorService.remove(id);
  }
}
