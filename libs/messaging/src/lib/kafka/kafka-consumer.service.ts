import {
  Injectable,
  Inject,
  Logger,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Kafka, type Consumer, type EachMessagePayload } from 'kafkajs';
import type { KafkaModuleOptions } from './kafka.module.js';

export interface KafkaMessageHandler {
  (payload: {
    topic: string;
    partition: number;
    key: string | null;
    value: unknown;
    headers: Record<string, string | undefined>;
    offset: string;
    timestamp: string;
  }): Promise<void>;
}

@Injectable()
export class KafkaConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly consumers: Consumer[] = [];
  private kafka!: Kafka;

  constructor(
    @Inject('KAFKA_MODULE_OPTIONS') private readonly options: KafkaModuleOptions,
  ) {
    this.kafka = new Kafka({
      clientId: this.options.clientId,
      brokers: this.options.brokers,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });
  }

  async subscribe(
    topics: string[],
    groupId: string,
    handler: KafkaMessageHandler,
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          const { topic, partition, message } = payload;
          const key = message.key?.toString() || null;
          const value = message.value
            ? JSON.parse(message.value.toString())
            : null;
          const headers: Record<string, string | undefined> = {};

          if (message.headers) {
            for (const [headerKey, headerValue] of Object.entries(message.headers)) {
              headers[headerKey] = headerValue?.toString();
            }
          }

          await handler({
            topic,
            partition,
            key,
            value,
            headers,
            offset: message.offset,
            timestamp: message.timestamp,
          });
        } catch (error) {
          this.logger.error(
            `Error processing message from ${payload.topic}: ${(error as Error).message}`,
            (error as Error).stack,
          );
        }
      },
    });

    this.consumers.push(consumer);
    this.logger.log(`Subscribed to topics: ${topics.join(', ')} with group: ${groupId}`);
  }

  async onModuleDestroy(): Promise<void> {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
    this.logger.log('All Kafka consumers disconnected');
  }
}
