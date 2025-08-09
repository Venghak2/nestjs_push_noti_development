import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { users } from '@prisma/client';
import { dayjsTz } from '@app/common/dayjs';
import { TranslateService } from '@app/common/translate';

@Injectable()
export class SubscribeService {
  private readonly logger = new Logger(SubscribeService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly translateService: TranslateService
  ) { }

  async subscriber(dto: CreateSubscribeDto, user: users) {
    const now = dayjsTz();
    try {
      const dataExisting = await this.checkUserSubscribe(user.uid);
      if (dataExisting) {
        await this.prismaService.subscribers.update({
          where: { uid: dataExisting.uid },
          data: {
            token: dto.token,
            is_subscribe: true,
            updated_at: now.toDate(),
          }
        })
        this.logger.log(`Update user subscribed successfully`);
        return {
          isSuccess: true,
          message: this.translateService.translate('success.ALREADY-SUBSCRIBED', {
            args: { data: user.username }
          }),
        }
      }
      const sub = await this.prismaService.subscribers.create({
        data: {
          user_uid: user.uid,
          token: dto.token,
          is_subscribe: true,
          created_at: now.toDate(),
        },
      });
      this.logger.log(`User subscribed successfully: ${sub.uid}`);

      return {
        isSuccess: true,
        message: this.translateService.translate("success.CREATED-SUCCESS", {
          args: { property: "subscribe" }
        }),
        data: sub
      };

    } catch (err) {
      this.logger.error('Fail to subscribe for user.', err);
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }

  async unsubscriber(user: users) {
    const now = dayjsTz();
    try {
      const sub = await this.prismaService.subscribers.updateMany({
        where: { user_uid: user.uid },
        data: {
          is_subscribe: false,
          updated_at: now.toDate(),
        }
      })
      this.logger.log(`User unsubscribed successfully: ${user.uid}`);
      return {
        isSuccess: true,
        message: this.translateService.translate('success.UNSUBSCRIBE-SUCCESS', {
          args: { data: user.username },
        }),
      }

    }
    catch (err) {
      this.logger.error('Fail to unsubscribe for user.', err);
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }


  async checkUserSubscribe(userUid: string) {
    const existing = await this.prismaService.subscribers.findFirst({
      where: {
        user_uid: userUid,
        is_subscribe: false,
      },
    });

    return existing;
  }
}
