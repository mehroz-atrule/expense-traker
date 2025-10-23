import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'officeId', required: false, description: 'Filter by Office ID' })
  @ApiQuery({ name: 'month', required: false, description: 'Month filter, format "MM-YYYY" or "Month-YYYY"' })
  async getStats(
    @Query('officeId') officeId?: string,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getStats(officeId, month);
  }
}
