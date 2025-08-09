import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CampaignReportService } from './campaign_report.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiPaginationQuery, GlobalLanguageApiHeader, PaginationOptions, User } from '@app/common/decorator';
import { IPaginationOptions } from '@app/common/dto/pagination-options.dto';
import { CreateCampaignReportDto } from './dto/create-campaign_report.dto';
import { users } from '@prisma/client';

@GlobalLanguageApiHeader()
@Controller('campaign-report')
@ApiTags('CAMPAIGN REPORT')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class CampaignReportController {
  constructor(private readonly campaignReportService: CampaignReportService) {}

  @Get()
  @ApiPaginationQuery()
  pagination(@User() user: users,@PaginationOptions() options: IPaginationOptions) {
    return this.campaignReportService.paginationCampaignReport(user,options);
  }

  @Get(':uid')
  getCampaignReportByUid(@Param('uid', ParseUUIDPipe) uid: string){
    return this.campaignReportService.getCampaignReportByUid(uid);
  }

  @Post('/send-message')
  createAndSendNow(@User() user: users,@Body() createCampaignReportDto: CreateCampaignReportDto) {
    return this.campaignReportService.createAndsendNowCampaignReport(user,createCampaignReportDto);
  }
}
