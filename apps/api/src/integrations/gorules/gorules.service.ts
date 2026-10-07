import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ZenEngine } from '@gorules/zen-engine';
import * as fs from 'fs';
import * as path from 'path';

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
export class GoRulesService implements OnModuleInit {
  private readonly logger = new Logger(GoRulesService.name);
  private decision: any;

  onModuleInit() {
    try {
      const engine = new ZenEngine();
      const rulePath = path.join(__dirname, 'loan-risk.json');
      const ruleContent = fs.readFileSync(rulePath);
      this.decision = engine.createDecision(ruleContent);
      this.logger.log(`GoRules decision engine initialized from ${rulePath}`);
    } catch (error) {
      this.logger.error(`Failed to initialize GoRules engine: ${(error as Error).message}`);
      throw new ServiceUnavailableException('Risk engine unavailable');
    }
  }

  async evaluateLoanRisk(input: GoRulesInput): Promise<GoRulesOutput> {
    try {
      const result = await this.decision.evaluate(input);
      const data = result.result;

      if (!data) {
        throw new Error('No result returned from engine');
      }

      if (typeof data.riskScore !== 'number') {
        throw new Error('Invalid or missing riskScore');
      }

      if (!['LOW', 'MEDIUM', 'HIGH'].includes(data.riskLevel)) {
        throw new Error(`Invalid riskLevel: ${data.riskLevel}`);
      }

      if (!['AUTO_APPROVE', 'REVIEW', 'REJECT'].includes(data.decision)) {
        throw new Error(`Invalid decision: ${data.decision}`);
      }

      if (!Array.isArray(data.reasons)) {
        throw new Error('Invalid or missing reasons');
      }

      return {
        riskScore: data.riskScore,
        riskLevel: data.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH',
        decision: data.decision as 'AUTO_APPROVE' | 'REVIEW' | 'REJECT',
        reasons: data.reasons,
      };
    } catch (error) {
      this.logger.error(`GoRules evaluation failed: ${(error as Error).message}`);
      throw new ServiceUnavailableException('Risk engine unavailable');
    }
  }
}
