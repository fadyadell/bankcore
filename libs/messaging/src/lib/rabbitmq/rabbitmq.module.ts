import { Module, type DynamicModule } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq-producer.service';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFactory: (...args: any[]) => RabbitMQModuleOptions | Promise<RabbitMQModuleOptions>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
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
