import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { CreateCampaignScheduleDto } from './dto/create-campaign_schedule.dto';
import { dayjsTz } from '@app/common/dayjs';
import { IPaginationOptions } from '@app/common/dto/pagination-options.dto';
import { Prisma, status, users } from '@prisma/client';
import { UpdateCampaignScheduleDto } from './dto/update-campaign_schedule.dto';
import { TranslateService } from '@app/common/translate';
import { TIME_ZONE_TH } from '@app/common/constants';

@Injectable()
export class CampaignScheduleService {
  private readonly logger = new Logger(CampaignScheduleService.name);
  private readonly selectCampaignSchedule: Prisma.campaign_schedulesSelect;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly translateService: TranslateService
  ) { }

  async pagination(
    user: users,
    options: IPaginationOptions,
  ) {
    try {
      const result =
        await this.prismaService.custom.campaign_schedules.pagination(options, {
          select: this.selectCampaignSchedule,
          where: {
            user_uid: user.uid
          },
          orderBy: { uid: 'desc' },
        });
      this.logger.log(
        `Successfully fetched paginated campaign schedules on page ${options.page} with limit ${options.limit}`,
      );

      return result;
    } catch (err) {
      this.logger.error(
        `Error fetching paginated campaign schedules on page ${options.page} with limit ${options.limit}: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }

  async getCampaignScheduleByUid(uid: string) {
    try {
      const schedule = await this.prismaService.campaign_schedules.findFirst({
        where: { uid }
      })
      if (!schedule) {
        throw new NotFoundException(
          this.translateService.translate("error.ID-NOT-FOUND", {
            args: {
              property: this.translateService.translate("property.CAMPAIGN-SCHEDULE"),
              id: uid
            }
          })
        )
      }
      return {
        isSuccess: true,
        data: schedule
      }
    }
    catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException)  throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      )
    }
  }

  async createCampaignSchedule(user: users, dto: CreateCampaignScheduleDto) {
    try {
      const draft = await this.prismaService.drafts.findFirst({
        where: { uid: dto.draftUId, user_uid: user.uid },
      });

      if (!draft) {
        throw new NotFoundException(
          this.translateService.translate('error.ID-NOT-FOUND', {
            args: {
              property: this.translateService.translate("property.DRAFT"),
              id: dto.draftUId
            },
          })
        );
      }

      const campaignSchedules: any[] = [];

      for (const datetime of dto.datetimeSend) {
        const thDateTime = dayjsTz(datetime).tz(TIME_ZONE_TH, true).toDate();

        const campaignSchedule = await this.prismaService.campaign_schedules.create({
          data: {
            user_uid: user.uid,
            draft_uid: draft.uid,
            type: draft.target_user,
            datetime_send: thDateTime,
            status: status.PENDING,
            created_at: dayjsTz().toDate(),
          },
        });
        campaignSchedules.push(campaignSchedule);
      }

      this.logger.log(`Created campaign schedule successfully: ${campaignSchedules.length}`);
      return {
        isSuccess: true,
        message: this.translateService.translate("success.CREATED-SUCCESS", {
          args: {
            property: this.translateService.translate("property.CAMPAIGN-SCHEDULE")
          }
        }),
        data: campaignSchedules
      };
    } catch (err) {
      this.logger.error(`Failed to create campaign schedule`, err);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }

  async updateCampaignSchedule(user: users, uid: string, dto: UpdateCampaignScheduleDto) {
    try {
      await this.checkCampaignScheduleByUid(user, uid);
      const updatedSchedule =
        await this.prismaService.campaign_schedules.update({
          where: { uid },
          data: {
            datetime_send: dto.datetimeSend,
            updated_at: dayjsTz().toDate(),
          },
        });

      this.logger.log(`Updated campaign schedule with UID ${uid} successfully`);
      return {
        isSuccess: true,
        message: this.translateService.translate("success.UPDATED-SUCCESS", {
          args: {
            property: this.translateService.translate("property.CAMPAIGN-SCHEDULE")
          }
        }),
        data: updatedSchedule,
      };
    } catch (err) {
      this.logger.error(
        `Failed to update campaign schedule with UID ${uid}`,
        err,
      );
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }

  async checkCampaignScheduleByUid(user: users, uid: string) {
    const existingSchedule = await this.prismaService.campaign_schedules.findUnique({
      where: { uid, user_uid: user.uid },
    });

    if (!existingSchedule) {
      throw new NotFoundException(
        this.translateService.translate('error.ID-NOT-FOUND', {
          args: {
            property: this.translateService.translate("property.CAMPAIGN-SCHEDULE"),
            id: uid
          },
        })
      );
    }
  }

  async deleteCampaignSchedule(user: users, uid: string) {
    try {
      await this.checkCampaignScheduleByUid(user, uid);
      await this.prismaService.campaign_schedules.delete({
        where: { uid, user_uid: user.uid },
      });
      
      this.logger.log(`Deleted campaign schedule with ID ${uid} successfully`);
      return {
        isSuccess: true,
        message: this.translateService.translate("success.DELETED-SUCCESS", {
          args: {
            property: this.translateService.translate("property.CAMPAIGN-SCHEDULE")
          }
        }),
      };
    } catch (err) {
      this.logger.error(
        `Failed to delete campaign schedule with UID ${uid}`,
        err,
      );
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }
}
