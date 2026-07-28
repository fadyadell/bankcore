import { Module, type DynamicModule } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq-producer.service.js';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service.js';

export interface RabbitMQModuleOptions {
  url: string;
  exchange: string;
  exchangeType?: string;
  queue: string;
  deadLetterExchange?: string;
  deadLetterQueue?: string;
  prefetchCount?: number;
}

@Module({})
export class RabbitMQModule {
  static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      global: true,
      providers: [
        {
          provide: 'RABBITMQ_MODULE_OPTIONS',
          useValue: options,
        },
        RabbitMQProducerService,
        RabbitMQConsumerService,
      ],
      exports: [RabbitMQProducerService, RabbitMQConsumerService],
    };
  }

  static forRootAsync(optionsFactory: {
    useFactory: (...args: unknown[]) => RabbitMQModuleOptions | Promise<RabbitMQModuleOptions>;
    inject?: unknown[];
  }): DynamicModule {
    return {
      module: RabbitMQModule,
      global: true,
      providers: [
        {
          provide: 'RABBITMQ_MODULE_OPTIONS',
          useFactory: optionsFactory.useFactory,
          inject: optionsFactory.inject || [],
        },
        RabbitMQProducerService,
        RabbitMQConsumerService,
      ],
      exports: [RabbitMQProducerService, RabbitMQConsumerService],
    };
  }
}
