import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { randomUUID } from 'crypto';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private connected = false;
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor() {
    this.kafka = new Kafka({
      clientId: 'bankcore',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.connected = true;
      this.logger.log('Kafka Producer connected');
    } catch (error) {
      this.logger.warn(`Kafka unavailable (${(error as Error).message}). Event publishing will be degraded.`);
    }
  }

  async onModuleDestroy() {
    if (!this.connected) return;
    await this.producer.disconnect();
  }

  async publish(topic: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.connected) {
      this.logger.warn(`Kafka not connected. Skipping publish to ${topic}`);
      return;
    }
    const key = (payload.entityId as string) ?? randomUUID();
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(payload) }],
    });
    this.logger.log(`Published to ${topic}: ${key}`);
  }
}

