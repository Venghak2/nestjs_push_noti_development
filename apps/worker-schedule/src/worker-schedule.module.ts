import { Module } from '@nestjs/common';
import { WorkerScheduleController } from './worker-schedule.controller';
import { WorkerScheduleService } from './worker-schedule.service';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FirebaseAdminService } from 'apps/worker/src/firebase-admin/firebase-admin.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule
  ],
  controllers: [WorkerScheduleController],
  providers: [WorkerScheduleService, FirebaseAdminService],
})
export class WorkerScheduleModule {}
