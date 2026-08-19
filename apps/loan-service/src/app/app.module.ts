import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from '@bankcore/prisma-client';

@Module({
  imports: [PrismaModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
