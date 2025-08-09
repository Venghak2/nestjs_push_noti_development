import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { GlobalLanguageApiHeader, User } from '@app/common/decorator';
import { users } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@GlobalLanguageApiHeader()
@Controller()
@ApiTags('SUBSCRIBE')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) { }

  @Post('subscribe')
  subscribe(@Body() dto: CreateSubscribeDto, @User() user: users) {
    return this.subscribeService.subscriber(dto, user);
  }

  @Post('unsubscribe')
  unsubscribe(@User() user: users) {
    return this.subscribeService.unsubscriber(user);
  }

}
