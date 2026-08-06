import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('loan.events');
    await this.kafkaClient.connect();
  }

  async emitEvent(topic: string, data: any) {
    this.logger.log(`Emitting event to topic ${topic}`);
    this.kafkaClient.emit(topic, data);
  }
}
