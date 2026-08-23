import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async markFinal(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status === 'ACTIVE' || loan.status === 'CLOSED' || loan.status === 'REJECTED') {
      throw new BadRequestException(`Cannot finalize a loan in status ${loan.status}`);
    }

    const updated = await this.prisma.loan.update({
      where: { id },
      data: { status: 'ACTIVE', approvedAt: new Date() },
    });

    this.logger.log(`Loan finalized: ${updated.referenceNumber}`);

    // In a full flow we might also notify via RabbitMQ or Kafka here
    return updated;
  }
}
