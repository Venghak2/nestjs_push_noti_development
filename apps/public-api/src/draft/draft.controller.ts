import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DraftService } from './draft.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { ApiPaginationQuery, GlobalLanguageApiHeader, PaginationOptions, User } from '@app/common/decorator';
import { IPaginationOptions } from '@app/common/dto/pagination-options.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { users } from '@prisma/client';

@GlobalLanguageApiHeader()
@Controller('draft')
@ApiTags('DRAFT')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class DraftController {
  constructor(private readonly draftService: DraftService) { }

  @Get()
  @ApiPaginationQuery()
  pagination(@User() user: users, @PaginationOptions() options: IPaginationOptions) {
    return this.draftService.paginationDrafts(user, options);
  }

  @Post()
  create(@User() user: users, @Body() createDraftDto: CreateDraftDto) {
    return this.draftService.createDraft(user, createDraftDto);
  }

  @Get(':uid')
  getDraft(@User() user: users, @Param('uid', ParseUUIDPipe) uid: string) {
    return this.draftService.getDraftsById(user, uid);
  }

  @Patch(':uid')
  update(
    @User() user: users,
    @Param('uid', ParseUUIDPipe) uid: string,
    @Body() updateDraftDto: UpdateDraftDto,
  ) {
    return this.draftService.updateDraft(user, uid, updateDraftDto);
  }

  @Delete(':uid')
  remove(@User() user: users, @Param('uid', ParseUUIDPipe) uid: string) {
    return this.draftService.deleteDraft(user, uid);
  }
}
