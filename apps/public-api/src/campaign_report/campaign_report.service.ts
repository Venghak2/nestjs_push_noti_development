import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { dayjsTz } from '@app/common/dayjs';
import { $Enums, Prisma, recipient, status, users } from '@prisma/client';
import { IPaginationOptions } from '@app/common/dto/pagination-options.dto';
import { CreateCampaignReportDto } from './dto/create-campaign_report.dto';
import { TranslateService } from '@app/common/translate';
import { ServicesEnum } from '@app/common/enums/services.enum';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CampaignReportService {
  private readonly logger = new Logger(CampaignReportService.name);
  private readonly selectCampaignReport: Prisma.campaign_reportsSelect;
  constructor(
    @Inject(ServicesEnum.WORKER_SERVICE) private readonly workerService: ClientProxy,
    private readonly prismaService: PrismaService,
    private readonly translateService: TranslateService,
  ) { }

  async paginationCampaignReport(user: users, options: IPaginationOptions) {
    try {
      const result =
        await this.prismaService.custom.campaign_reports.pagination(options, {
          select: this.selectCampaignReport,
          where: {
            user_uid: user.uid,
          },
          orderBy: { uid: 'desc' },
        });
      this.logger.log(
        `Successfully fetched paginated campaign report on page ${options.page} with limit ${options.limit}`,
      );
      return result;
    } catch (err) {
      this.logger.error(
        `Error fetching paginated campaign report on page ${options.page} with limit ${options.limit}: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err),
      );
    }
  }

  async getCampaignReportByUid(uid: string) {
    try {
      const report = await this.prismaService.campaign_reports.findFirst({
        where: { uid }
      });
      if (!report) {
        throw new NotFoundException(
          this.translateService.translate("error.ID-NOT-FOUND", {
            args: {
              property: this.translateService.translate("property.CAMPAIGN-REPORT"),
              id: uid
            }
          })
        )
      }

      return {
        isSuccess: true,
        data: report,
      }
    }
    catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      )
    }
  }

  async createAndsendNowCampaignReport(
    user: users,
    createCampaignReportDto: CreateCampaignReportDto,
  ) {
    const { title, message } = createCampaignReportDto;
    const now = dayjsTz();

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const subscribers = await tx.subscribers.findMany({
          where: { user_uid: user.uid, is_subscribe: true }
        });
  
        if (!subscribers || subscribers.length === 0) {
          throw new NotFoundException(
            this.translateService.translate('error.NOT-DATA-SUBSCRIBED'),
          );
        }
  
        await tx.campaign_reports.create({
          data: {
            user_uid: user.uid,
            title,
            message,
            schedule: 'Pre-set',
            target_user: 'ALL',
            delivery_schedules: now.toDate(),
            players: subscribers.length,
            device: 'Browser',
            credit_usage: '',
           token_subscriber: '',
            status: status.SUCCESS,
            created_at: now.toDate(),
          },
        });

        const payload = { user, title, message };
        const sendMessage = await lastValueFrom(
          this.workerService.send(ServicesEnum.SEND_MESSAGE, payload),
        ).catch((err) => {
          this.logger.error(`Error on worker send: ${err.message}`, err.stack);
          throw err;
        });

        this.logger.log('Send message to user successfully');
        return sendMessage;
      })
        
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('Error creating campaign report:', err);
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err),
      );
    }
  }

}
