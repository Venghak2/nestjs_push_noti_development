import { Module } from '@nestjs/common';
import { CampaignReportService } from './campaign_report.service';
import { CampaignReportController } from './campaign_report.controller';
import { TranslateModule } from '@app/common/translate';
import { RmqModule } from '@app/common/rmq';
import { ServicesEnum } from '@app/common/enums/services.enum';

@Module({
  imports: [
    RmqModule.register({
      name: ServicesEnum.WORKER_SERVICE,
    }),
    TranslateModule],
  controllers: [CampaignReportController],
  providers: [CampaignReportService],
})
export class CampaignReportModule {}
