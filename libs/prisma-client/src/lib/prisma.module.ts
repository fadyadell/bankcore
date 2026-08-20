import { Module, Global, type DynamicModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRoot(databaseUrl?: string): DynamicModule {
    return {
      module: PrismaModule,
      global: true,
      providers: [
        {
          provide: 'DATABASE_URL',
          useValue: databaseUrl,
        },
        PrismaService,
      ],
      exports: [PrismaService],
    };
  }
}
