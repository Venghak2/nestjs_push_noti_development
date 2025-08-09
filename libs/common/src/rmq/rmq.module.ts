import { DynamicModule, Logger, Module } from '@nestjs/common'
import { RmqService } from './rmq.service'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'

interface RmqModuleOptions {
  name: string
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => {
              Logger.log(`🚀 Listening for messages on queue [${name}_QUEUE]`)
              return {
                transport: Transport.RMQ,
                options: {
                  urls: [configService.get<string>('RABBIT_MQ_URI')!],
                  queue: `${name}_QUEUE`,
                },
              }
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    }
  }
}
