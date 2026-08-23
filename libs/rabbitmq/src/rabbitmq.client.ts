import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQClientService {
  private readonly logger = new Logger(RabbitMQClientService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendCommand(pattern: string, data: any): Promise<any> {
    this.logger.log(`Sending command [${pattern}] to RabbitMQ`);
    return firstValueFrom(this.client.send(pattern, data));
  }
}
