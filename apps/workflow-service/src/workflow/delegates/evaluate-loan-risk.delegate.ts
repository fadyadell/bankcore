import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import { GoRulesService } from '@bankcore/common';

@Injectable()
export class EvaluateLoanRiskDelegate {
  private readonly logger = new Logger(EvaluateLoanRiskDelegate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly goRulesService: GoRulesService,
  ) {}

  async execute(loanId: string): Promise<any> {
    this.logger.log(`Evaluating loan risk for loan ${loanId}`);
    
    const loan = await this.prisma.loan.findUnique({ 
      where: { id: loanId },
      include: { user: true }
    });

    if (!loan) {
      this.logger.error(`Loan ${loanId} not found`);
      return { riskTier: 'UNKNOWN' };
    }

    try {
      // Create input for GoRules evaluation
      const input = {
        amount: Number(loan.amount),
        termMonths: loan.termMonths,
        existingLoans: 0
      };

      const result = await this.goRulesService.evaluateLoanRisk(input);
      this.logger.log(`Loan ${loanId} evaluated with risk tier: ${result.riskTier}`);
      
      // Save risk tier back to loan
      await this.prisma.loan.update({
        where: { id: loanId },
        data: { riskLevel: result.riskTier }
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to evaluate loan risk for ${loanId}`, error);
      return { riskTier: 'HIGH_RISK' }; // Fail safe to high risk
    }
  }
}
