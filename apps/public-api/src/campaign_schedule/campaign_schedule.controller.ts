import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CampaignScheduleService } from './campaign_schedule.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCampaignScheduleDto } from './dto/create-campaign_schedule.dto';
import { ApiPaginationQuery, GlobalLanguageApiHeader, PaginationOptions, User } from '@app/common/decorator';
import { IPaginationOptions } from '@app/common/dto/pagination-options.dto';
import { users } from '@prisma/client';
import { UpdateCampaignScheduleDto } from './dto/update-campaign_schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@GlobalLanguageApiHeader()
@Controller('campaign-schedule')
@ApiTags('CAMPAIGN SCHEDULE')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class CampaignScheduleController {
  constructor(
    private readonly campaignScheduleService: CampaignScheduleService,
  ) { }

  @Get()
  @ApiPaginationQuery()
  pagination(
    @User() user: users,
    @PaginationOptions() options: IPaginationOptions,
  ) {
    return this.campaignScheduleService.pagination(user,options);
  }

  @Get(':uid')
  getCampaignSchedule(@Param('uid', ParseUUIDPipe) uid: string){
    return this.campaignScheduleService.getCampaignScheduleByUid(uid);
  }

  @Post()
  create(@User() user: users,@Body() dto: CreateCampaignScheduleDto) {
    return this.campaignScheduleService.createCampaignSchedule(user,dto);
  }

  @Patch(':uid')
  update(
    @User() user: users,
    @Param('uid', ParseUUIDPipe) uid: string,
    @Body() dto: UpdateCampaignScheduleDto,
  ) {
    return this.campaignScheduleService.updateCampaignSchedule(user,uid, dto);
  }

  @Delete(':uid')
  remove(@User() user: users,@Param('uid', ParseUUIDPipe) uid: string) {
    return this.campaignScheduleService.deleteCampaignSchedule(user,uid);
  }
}
