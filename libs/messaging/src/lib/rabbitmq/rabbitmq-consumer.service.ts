import { Injectable, Inject, Logger, type OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';
import type { RabbitMQModuleOptions } from './rabbitmq.module';

export interface RabbitMQMessageHandler {
  (message: {
    content: unknown;
    routingKey: string;
    headers: Record<string, unknown>;
    timestamp?: number;
  }): Promise<void>;
}

@Injectable()
export class RabbitMQConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConsumerService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private connection!: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private channel!: any;

  constructor(@Inject('RABBITMQ_MODULE_OPTIONS') private readonly options: RabbitMQModuleOptions) {}

  async consume(
    queue: string,
    routingKeys: string[],
    handler: RabbitMQMessageHandler,
  ): Promise<void> {
    this.connection = await amqplib.connect(this.options.url);
    this.channel = await this.connection.createChannel();

    const prefetchCount = this.options.prefetchCount || 10;
    await this.channel.prefetch(prefetchCount);

    const exchangeType = this.options.exchangeType || 'topic';
    await this.channel.assertExchange(this.options.exchange, exchangeType, {
      durable: true,
    });

    await this.channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: this.options.deadLetterExchange,
    });

    for (const routingKey of routingKeys) {
      await this.channel.bindQueue(queue, this.options.exchange, routingKey);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.channel.consume(queue, async (msg: any) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const headers: Record<string, unknown> = {};

        if (msg.properties.headers) {
          for (const [key, value] of Object.entries(
            msg.properties.headers as Record<string, unknown>,
          )) {
            headers[key] = value instanceof Buffer ? value.toString() : value;
          }
        }

        await handler({
          content,
          routingKey: msg.fields.routingKey,
          headers,
          timestamp: msg.properties.timestamp,
        });

        this.channel.ack(msg);
      } catch (error) {
        this.logger.error(
          `Error processing RabbitMQ message: ${(error as Error).message}`,
          (error as Error).stack,
        );
        this.channel.nack(msg, false, false);
      }
    });

    this.logger.log(`Consuming from queue ${queue} with routing keys: ${routingKeys.join(', ')}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.logger.log('RabbitMQ consumer disconnected');
  }
}
