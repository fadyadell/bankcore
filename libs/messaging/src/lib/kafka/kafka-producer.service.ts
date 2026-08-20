import {
  Injectable,
  Inject,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { Kafka, type Producer, type ProducerRecord, CompressionTypes } from 'kafkajs';
import type { KafkaModuleOptions } from './kafka.module';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer!: Producer;
  private kafka!: Kafka;

  constructor(@Inject('KAFKA_MODULE_OPTIONS') private readonly options: KafkaModuleOptions) {}

  async onModuleInit(): Promise<void> {
    this.kafka = new Kafka({
      clientId: this.options.clientId,
      brokers: this.options.brokers,
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });

    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publish(topic: string, event: any): Promise<void> {
    const record: ProducerRecord = {
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            correlationId: event.correlationId || '',
            timestamp: event.timestamp,
          },
        },
      ],
    };

    await this.producer.send(record);
    this.logger.debug(`Published event ${event.eventType} to topic ${topic}`);
  }

  async publishBatch(
    topic: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: any[],
  ): Promise<void> {
    const record: ProducerRecord = {
      topic,
      compression: CompressionTypes.GZIP,
      messages: events.map((event) => ({
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          eventType: event.eventType,
          correlationId: event.correlationId || '',
          timestamp: event.timestamp,
        },
      })),
    };

    await this.producer.send(record);
    this.logger.debug(`Published ${events.length} events to topic ${topic}`);
  }
}
