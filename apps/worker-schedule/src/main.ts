import { NestFactory } from '@nestjs/core';
import { WorkerScheduleModule } from './worker-schedule.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerScheduleModule);
  await app.listen(7007);
}
bootstrap();
