import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'libs/common/src/prisma/prisma.module';
import { RegisterModule } from './register/register.module';
import { DraftModule } from './draft/draft.module';
import { CampaignReportModule } from './campaign_report/campaign_report.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { AppController } from './app.controller';
import { CampaignScheduleModule } from './campaign_schedule/campaign_schedule.module';
import { TranslateModule } from '@app/common/translate';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { ServicesEnum } from '@app/common/enums/services.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true 
    }),
    RmqModule.register({
      name: ServicesEnum.WORKER_SERVICE,
    }),
    PrismaModule,
    RegisterModule, 
    AuthModule,
    UserModule,
    DraftModule,
    CampaignScheduleModule,
    CampaignReportModule,
    SubscribeModule,
    TranslateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
