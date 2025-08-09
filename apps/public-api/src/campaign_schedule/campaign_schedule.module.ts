import { Module } from '@nestjs/common';
import { CampaignScheduleService } from './campaign_schedule.service';
import { CampaignScheduleController } from './campaign_schedule.controller';

@Module({
  controllers: [CampaignScheduleController],
  providers: [CampaignScheduleService],
})
export class CampaignScheduleModule {}
