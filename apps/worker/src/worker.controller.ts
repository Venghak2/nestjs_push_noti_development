import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ServicesEnum } from '@app/common/enums/services.enum';
import { PushNotificationPayloadDto } from '@app/common/dto/push-notification-payload.dto';
import { RmqExceptionFilter } from '@app/common/rmq/rmq.filter';
import { RmqAckInterceptor } from '@app/common/rmq/rmq.interceptor';

@UseInterceptors(RmqAckInterceptor)
@UseFilters(new RmqExceptionFilter())
@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Get()
  getHello(): string {
    return this.workerService.getHello();
  }

  // @EventPattern(ServicesEnum.SEND)
  // async sendNotification(@Payload() payload: PushNotificationPayloadDto){
  //   return await this.workerService.sendPushNotification(payload);
  // }

  @EventPattern(ServicesEnum.SEND_MESSAGE)
  async sendNotificationAll(@Payload() payload: PushNotificationPayloadDto){
    return await this.workerService.sendPushNotificationToAll(payload);
  }
}
