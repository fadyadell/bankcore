import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface GoRulesInput {
  loanAmount: number;
  termMonths: number;
  monthlyIncome: number;
  existingLoanCount: number;
  existingDebt: number;
  accountBalance: number;
}

export interface GoRulesOutput {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  decision: 'AUTO_APPROVE' | 'REVIEW' | 'REJECT';
  reasons: string[];
}

@Injectable()
export class GoRulesService {
  private readonly logger = new Logger(GoRulesService.name);
  private readonly goRulesUrl =
    process.env.GORULES_URL || 'http://localhost:4000/api/evaluate';

  async evaluateLoanRisk(input: GoRulesInput): Promise<GoRulesOutput> {
    try {
      if (process.env.NODE_ENV === 'test') {
        return this.mockEvaluation(input);
      }

      // We wrap the input in a standard GoRules execution format, but since we may not
      // have an actual GoRules decision table loaded, we will implement a soft fallback.
      const response = await axios.post<{ result?: Partial<GoRulesOutput> }>(
        this.goRulesUrl,
        { context: input },
        { timeout: 5000 },
      );

      // Map the response appropriately
      const data = response.data;
      if (data && data.result) {
        return {
          riskScore: data.result.riskScore ?? 50,
          riskLevel: data.result.riskLevel ?? 'MEDIUM',
          decision: data.result.decision ?? 'REVIEW',
          reasons: data.result.reasons ?? ['Standard review required'],
        };
      }

      throw new Error('Malformed decision from GoRules');
    } catch (error) {
      this.logger.error(
        `GoRules evaluation failed: ${(error as Error).message}`,
      );
      throw new Error('Risk Engine Unavailable');
    }
  }

  private mockEvaluation(input: GoRulesInput): GoRulesOutput {
    // Basic mock logic for testing
    if (input.loanAmount > 100000) {
      return {
        riskScore: 90,
        riskLevel: 'HIGH',
        decision: 'REJECT',
        reasons: ['Amount exceeds maximum limit'],
      };
    }

    if (input.accountBalance >= input.loanAmount) {
      return {
        riskScore: 20,
        riskLevel: 'LOW',
        decision: 'AUTO_APPROVE',
        reasons: ['High liquidity'],
      };
    }

    return {
      riskScore: 50,
      riskLevel: 'MEDIUM',
      decision: 'REVIEW',
      reasons: ['Requires manual review'],
    };
  }
}
