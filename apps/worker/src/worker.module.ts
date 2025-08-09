import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { TranslateModule } from '@app/common/translate';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common/rmq/rmq.module';
import { ServicesEnum } from '@app/common/enums/services.enum';
import { PrismaModule } from '@app/common/prisma/prisma.module';
import { LoggerModule } from '@app/common/logger/logger.module';
import { FirebaseAdminService } from './firebase-admin/firebase-admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RmqModule.register({
      name: ServicesEnum.WORKER_SERVICE,
    }),
    PrismaModule,
    TranslateModule,
    LoggerModule
  ],
  controllers: [WorkerController],
  providers: [WorkerService, FirebaseAdminService],
})
export class WorkerModule {}
