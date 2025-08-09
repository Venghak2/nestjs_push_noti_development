import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { Prisma, recipient, users } from '@prisma/client';
import { dayjsTz } from '@app/common/dayjs';
import { IPaginationOptions } from '@app/common/dto/pagination-options.dto';
import { TranslateService } from '@app/common/translate';

@Injectable()
export class DraftService {
    private readonly logger = new Logger(DraftService.name);
    private readonly selectDraft: Prisma.draftsSelect;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly translateService: TranslateService
    ) { }

    async paginationDrafts(user:users,options: IPaginationOptions) {
        try {
            const result = await this.prismaService.custom.drafts.pagination(
                options,
                {
                    select: this.selectDraft,
                    where:{
                        user_uid: user.uid
                    },
                    orderBy: { uid: 'desc' },
                },
            );
            this.logger.log(
                `Successfully fetched paginated draft on page ${options.page} with limit ${options.limit}`,
            );

            return result;
        } catch (err) {
            this.logger.error(
                `Error fetching paginated draft on page ${options.page} with limit ${options.limit}: ${err.message}`,
                err.stack,
            );
            throw new InternalServerErrorException(
                this.translateService.translate(err.message ?? err)
            );
        }
    }

    async createDraft(user:users,createDraftDto: CreateDraftDto) {
        const { title, message } = createDraftDto;
        const now = dayjsTz();
        try {
            const draft = await this.prismaService.drafts.create({
                data: {
                    user_uid:user.uid,
                    campaign_name: '',
                    title,
                    message,
                    last_modified: now.toDate(),
                    target_user: recipient.ALL_USERS,
                    token_subscriber: '',
                    device: 'Browser',
                    upload_file: '',
                    upload_image: '',
                    created_at: now.toDate()
                },
            });

            this.logger.log(`Draft created successfully`);
            return {
                isSuccess: true,
                message: this.translateService.translate("success.CREATED-SUCCESS",{
                    args: {
                        property: this.translateService.translate("property.DRAFT")
                    }
                }),
                data: draft
            };
        } catch (err) {
            this.logger.error('Error creating draft:', err);
            throw new InternalServerErrorException(
                this.translateService.translate(err.message ?? err)
            );
        }
    }

    async updateDraft(user:users,uid: string, updateDraftDto: UpdateDraftDto) {
        try {
            const { title, message} = updateDraftDto;
            const now = dayjsTz();
            const checkDraft = await this.getDraftsById(user,uid);
            const draft = await this.prismaService.drafts.update({
                where: { uid: checkDraft.uid,user_uid:user.uid },
                data: {
                    title,
                    message,
                    last_modified: now.toDate(),
                    // target_user: ''
                    // token_subscriber: tokenSubscriber,
                    updated_at: now.toDate()
                },
            });

            this.logger.log(`Draft updated successfully: ${draft.uid}`);
            return {
                isSuccess: true,
                message: this.translateService.translate("success.UPDATED-SUCCESS",{
                    args: {
                        property: this.translateService.translate("property.DRAFT")
                    }
                }),
                data: draft
            };
        } catch (err) {
            this.logger.error('Error updating draft:', err);
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException(
                this.translateService.translate(err.message ?? err)
            );
        }
    }

    async deleteDraft(user:users,uid: string) {
        try {
            const checkDraft = await this.getDraftsById(user,uid);
            await this.prismaService.drafts.delete({
                where: { uid, user_uid: user.uid },
            });

            this.logger.log(`Draft deleted successfully: ${checkDraft.uid}`);
            return {
                isSuccess: true,
                message: this.translateService.translate("success.DELETED-SUCCESS",{
                    args: {
                        property: this.translateService.translate("property.DRAFT")
                    }
                })
            };
        } catch (err) {
            this.logger.error('Error deleting draft:', err);
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException(
                this.translateService.translate(err.message ?? err)
            );
        }
    }

    async getDraftsById(user:users,uid: string) {
        const draft = await this.prismaService.drafts.findUnique({
            where: { uid,user_uid: user.uid },
        });
        if (!draft) throw new NotFoundException(
            this.translateService.translate('error.ID-NOT-FOUND', {
                args: { 
                    property: this.translateService.translate("property.DRAFT"),
                    id: uid
                },
            })
        );
        return draft;
    }
}
