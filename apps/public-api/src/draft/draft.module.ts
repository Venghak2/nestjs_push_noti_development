import { Module } from '@nestjs/common';
import { DraftService } from './draft.service';
import { DraftController } from './draft.controller';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';

@Module({
  controllers: [DraftController],
  providers: [DraftService, PrismaService],
})
export class DraftModule { }
