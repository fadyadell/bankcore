import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

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
    this.logger.log(`Emitting event to topic ${topic}`);
    this.client.emit(topic, event);
  }
}
