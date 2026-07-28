import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import * as amqplib from 'amqplib';
import type { RabbitMQModuleOptions } from './rabbitmq.module.js';

@Injectable()
export class RabbitMQProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQProducerService.name);
  private connection!: amqplib.ChannelWrapper | amqplib.Connection;
  private channel!: amqplib.Channel;

  constructor(
    @Inject('RABBITMQ_MODULE_OPTIONS') private readonly options: RabbitMQModuleOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    this.connection = await amqplib.connect(this.options.url);
    this.channel = await (this.connection as amqplib.Connection).createChannel();

    const exchangeType = this.options.exchangeType || 'topic';
    await this.channel.assertExchange(this.options.exchange, exchangeType, {
      durable: true,
    });

    if (this.options.deadLetterExchange) {
      await this.channel.assertExchange(this.options.deadLetterExchange, 'topic', {
        durable: true,
      });
    }

    if (this.options.deadLetterQueue && this.options.deadLetterExchange) {
      await this.channel.assertQueue(this.options.deadLetterQueue, { durable: true });
      await this.channel.bindQueue(
        this.options.deadLetterQueue,
        this.options.deadLetterExchange,
        '#',
      );
    }

    await this.channel.assertQueue(this.options.queue, {
      durable: true,
      deadLetterExchange: this.options.deadLetterExchange,
    });

    this.logger.log(`RabbitMQ producer connected to ${this.options.exchange}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await (this.connection as amqplib.Connection)?.close();
    this.logger.log('RabbitMQ producer disconnected');
  }

  async publish(routingKey: string, message: unknown, headers?: Record<string, string>): Promise<void> {
    const content = Buffer.from(JSON.stringify(message));

    this.channel.publish(this.options.exchange, routingKey, content, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
      headers,
    });

    this.logger.debug(`Published message to ${this.options.exchange}:${routingKey}`);
  }
}
