import { Injectable, Logger } from '@nestjs/common';

export interface GoRulesEvaluationResult {
  decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  riskScore: number;
  reason?: string;
}

@Injectable()
export class GoRulesService {
  private readonly logger = new Logger(GoRulesService.name);

  async evaluateLoanApplication(amount: number, customerId: string): Promise<GoRulesEvaluationResult> {
    this.logger.log(`Evaluating loan for customer ${customerId} (Amount: ${amount}) via GoRules...`);
    
    // Mock GoRules evaluation logic
    // In production, this would make an HTTP request to the GoRules REST API
    
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network latency

    let riskScore = 50;
    if (amount > 100000) {
      riskScore += 30; // High amount increases risk
    }
    
    let decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' = 'MANUAL_REVIEW';
    if (riskScore < 40) {
      decision = 'APPROVED';
    } else if (riskScore > 75) {
      decision = 'REJECTED';
    }

    this.logger.log(`GoRules decision: ${decision} (Risk Score: ${riskScore})`);

    return {
      decision,
      riskScore,
      reason: decision === 'REJECTED' ? 'High risk score based on requested amount.' : undefined,
    };
  }
}
