import { Module, type DynamicModule } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service.js';
import { KafkaConsumerService } from './kafka-consumer.service.js';

export interface KafkaModuleOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
}

@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      global: true,
      providers: [
        {
          provide: 'KAFKA_MODULE_OPTIONS',
          useValue: options,
        },
        KafkaProducerService,
        KafkaConsumerService,
      ],
      exports: [KafkaProducerService, KafkaConsumerService],
    };
  }

  static forRootAsync(optionsFactory: {
    useFactory: (...args: unknown[]) => KafkaModuleOptions | Promise<KafkaModuleOptions>;
    inject?: unknown[];
  }): DynamicModule {
    return {
      module: KafkaModule,
      global: true,
      providers: [
        {
          provide: 'KAFKA_MODULE_OPTIONS',
          useFactory: optionsFactory.useFactory,
          inject: optionsFactory.inject || [],
        },
        KafkaProducerService,
        KafkaConsumerService,
      ],
      exports: [KafkaProducerService, KafkaConsumerService],
    };
  }
}
