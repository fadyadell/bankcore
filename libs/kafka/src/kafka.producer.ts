import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Kafka Producer...');
    // Connect to Kafka
    await this.client.connect();
  }

  async publish(topic: string, event: any): Promise<void> {
    const enrichedEvent = {
      eventId: randomUUID(),
      eventType: topic,
      occurredAt: new Date().toISOString(),
      ...event,
    };
    this.logger.log(`Emitting event to topic ${topic} with eventId ${enrichedEvent.eventId}`);
    this.client.emit(topic, enrichedEvent);
  }
}
