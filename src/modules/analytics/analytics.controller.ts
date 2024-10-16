import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller({ path: 'api/v1/analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('user-stats')
  async getUserStats() {
    return this.analyticsService.getUserStats();
  }

  @Get('content-stats')
  async getContentStats() {
    return this.analyticsService.getContentStats();
  }

  @Get('content-type-stats')
  async getVisitStats() {
    return this.analyticsService.getContentTypeStats();
  }

  @Get('/pkl-reports')
  async getPklReportsStats() {
    return this.analyticsService.getPklReportsStats();
  }
}
