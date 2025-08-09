import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { RmqService } from '@app/common/rmq/rmq.service';
import { ServicesEnum } from '@app/common/enums/services.enum';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(ServicesEnum.WORKER_SERVICE));
  await app.startAllMicroservices();
  await app.listen(7005);
}
bootstrap();
