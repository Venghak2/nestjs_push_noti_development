import { Controller, Get } from '@nestjs/common';
import { WorkerScheduleService } from './worker-schedule.service';

@Controller()
export class WorkerScheduleController {
  constructor(private readonly workerScheduleService: WorkerScheduleService) {}

  @Get()
  getHello(): string {
    return this.workerScheduleService.getHello();
  }
}
