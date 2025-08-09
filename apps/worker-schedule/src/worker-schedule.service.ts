import { TIME_ZONE_TH } from '@app/common/constants';
import { dayjsTz } from '@app/common/dayjs';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { recipient, status, subscribers } from '@prisma/client'; // <-- ADD `subscribers` type
import * as admin from 'firebase-admin';

@Injectable()
export class WorkerScheduleService {
  private readonly logger = new Logger(WorkerScheduleService.name);

  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'handleScheduledCampaigns',
    timeZone: TIME_ZONE_TH,
  })
  async handleScheduledCampaigns() {
    const currentDate = dayjsTz().tz(TIME_ZONE_TH);
    const startOfMinute = currentDate.startOf('minute').toDate();
    const endOfMinute = currentDate.endOf('minute').toDate();

    try {
      const schedules = await this.prismaService.campaign_schedules.findMany({
        where: {
          status: status.PENDING,
          datetime_send: { gte: startOfMinute, lte: endOfMinute,},
        },
        include: { draft: true },
      });
      if (!schedules.length) return;

      await Promise.all(
        schedules.map(async (schedule) => {
          const { uid, user_uid, type, draft, datetime_send } = schedule;
          const { title, message } = draft;

          const subscribers = await this.prismaService.subscribers.findMany({
            where: { user_uid, is_subscribe: true },
          });
          const tokens = subscribers.map((s) => s.token);

          await admin.messaging().sendEachForMulticast({
            tokens,
            notification: { title, body: message },
          });

          const updatedSchedule = await this.prismaService.campaign_schedules.update({
            where: { uid },
            data: {
              status: status.SUCCESS,
              updated_at: dayjsTz().toDate(),
            },
            include: { draft: true },
          });

          await this.prismaService.campaign_reports.create({
            data: {
              user_uid,
              title,
              message,
              schedule: 'Pre-set',
              target_user: type,
              delivery_schedules: datetime_send,
              device: 'Browser',
              players: tokens.length,
              status: updatedSchedule.status,
              credit_usage: '',
              created_at: dayjsTz().toDate(),
            },
          });
        })
      );
    } catch (err) {
      this.logger.error('Error in auto push notification', err);
      throw new InternalServerErrorException(err.message ?? err);
    }
  }
}
