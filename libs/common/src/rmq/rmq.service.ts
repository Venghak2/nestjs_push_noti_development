import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import * as amqp from 'amqplib';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBIT_MQ_URI')!],
        queue: `${queue}_QUEUE`,
        noAck,
        persistent: true,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    channel.ack(message);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const connection = await amqp.connect(
        this.configService.get<string>('RABBIT_MQ_URI'),
      );
      await connection.close();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }
}
