import { PushNotificationPayloadDto } from '@app/common/dto/push-notification-payload.dto';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { TranslateService } from '@app/common/translate';
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name)
  constructor(
    private readonly prismaService: PrismaService,
    private readonly translateService: TranslateService
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  // async sendPushNotification(payload: PushNotificationPayloadDto) {
  //   try {
  //     const { title, message, tokenSubscriber } = payload;
  //     const sendMessage = {
  //       token: tokenSubscriber,
  //       notification: {
  //         title: title,
  //         body: message,
  //       },
  //     };
  //     await admin.messaging().send(sendMessage);

  //     this.logger.log(`Sending push notification to subscribers success.`);
  //     return {
  //       isSuccess: true,
  //       message: this.translateService.translate('success.SUCCESS', {
  //         args: { 
  //           property: this.translateService.translate("property.PUSH-NOTIFICATION")
  //           },
  //       })
  //     }

  //   }
  //   catch (err){
  //     this.logger.error('Fail to send push notification.', err);
  //     throw new InternalServerErrorException(
  //       this.translateService.translate(err.message ?? err)
  //     );
  //   }
  // }

  async sendPushNotificationToAll(payload: PushNotificationPayloadDto) {
    try {
      const { user, title, message } = payload;
      const subscribers = await this.prismaService.subscribers.findMany({
        where: { user_uid: user.uid, is_subscribe: true }
      });
      if (subscribers.length === 0) {
        throw new NotFoundException(
          this.translateService.translate('error.NOT-DATA-SUBSCRIBED')
        );
      }

      const tokens = subscribers.map(subscriber => subscriber.token);
      const sendMessage = {
        tokens: tokens,
        notification: {
          title: title,
          body: message,
        },
      };
      await admin.messaging().sendEachForMulticast(sendMessage);
      this.logger.log(`Sending push notification to ${tokens.length} subscribers.`);
      return {
        isSuccess: true,
        message: this.translateService.translate('success.PUSH-ALL-SUCCESS')
      }
    } catch (err) {
      this.logger.error('Fail to send push notification to all.', err);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }
}
