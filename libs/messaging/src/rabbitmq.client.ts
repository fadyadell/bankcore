import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQClient implements OnModuleInit, OnModuleDestroy {
  private connection!: amqp.ChannelModel;
  private publishChannel!: amqp.Channel;
  private consumeChannel!: amqp.Channel;
  private connected = false;
  private readonly logger = new Logger(RabbitMQClient.name);

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.publishChannel = await this.connection.createChannel();
      this.consumeChannel = await this.connection.createChannel();
      this.connected = true;
      this.logger.log('RabbitMQ Client connected');
    } catch (error) {
      this.logger.warn(`RabbitMQ unavailable (${(error as Error).message}). Messaging will be degraded.`);
    }
  }

  async onModuleDestroy() {
    if (!this.connected) return;
    await this.publishChannel?.close();
    await this.consumeChannel?.close();
    await this.connection?.close();
  }

  async publish(queue: string, message: Record<string, unknown>): Promise<void> {
    if (!this.connected) {
      this.logger.warn(`RabbitMQ not connected. Skipping publish to ${queue}`);
      return;
    }
    await this.publishChannel.assertQueue(queue, { durable: true });
    this.publishChannel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    this.logger.log(`Published to RabbitMQ queue ${queue}`);
  }

  async consume(queue: string, handler: (msg: Record<string, unknown>) => Promise<void>): Promise<void> {
    if (!this.connected) {
      this.logger.warn(`RabbitMQ not connected. Skipping consume from ${queue}`);
      return;
    }
    await this.consumeChannel.assertQueue(queue, { durable: true });
    await this.consumeChannel.prefetch(1);
    
    this.consumeChannel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.consumeChannel.ack(msg);
        } catch (error) {
          this.logger.error(`Error processing message from ${queue}`, error);
          this.consumeChannel.nack(msg);
        }
      }
    });
  }
}

