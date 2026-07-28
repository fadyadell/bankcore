import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
  Inject,
  Optional,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Optional() @Inject('DATABASE_URL') databaseUrl?: string,
  ) {
    super({
      datasourceUrl: databaseUrl || process.env['DATABASE_URL'],
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  async cleanDatabase(): Promise<void> {
    if (process.env['NODE_ENV'] !== 'test') {
      throw new Error('cleanDatabase is only available in test environment');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    for (const model of models) {
      const delegate = (this as Record<string, unknown>)[model as string];
      if (delegate && typeof delegate === 'object' && 'deleteMany' in delegate) {
        await (delegate as { deleteMany: () => Promise<unknown> }).deleteMany();
      }
    }
  }
}
