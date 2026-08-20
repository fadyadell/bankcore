import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GoRulesService {
  private readonly logger = new Logger(GoRulesService.name);

  constructor(private configService: ConfigService) {}

  async evaluateLoanRisk(input: {
    amount: number;
    termMonths: number;
    existingLoans: number;
  }): Promise<{ riskTier: 'LOW' | 'MEDIUM' | 'HIGH' }> {
    const gorulesUrl = this.configService.get<string>('GORULES_URL', 'http://localhost:8081');

    try {
      const response = await axios.post(`${gorulesUrl}/evaluate/loan-risk`, input, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 3000,
      });

      const riskTier = response.data?.result?.riskTier;
      if (!riskTier) {
        throw new Error('Invalid response from GoRules: riskTier not found');
      }
      return { riskTier };
    } catch (error) {
      this.logger.warn(`GoRules unavailable, using local risk assessment fallback: ${(error as Error).message}`);
      return this.localRiskAssessment(input);
    }
  }

  private localRiskAssessment(input: {
    amount: number;
    termMonths: number;
    existingLoans: number;
  }): { riskTier: 'LOW' | 'MEDIUM' | 'HIGH' } {
    // Simple local decision logic matching gorules/loan-risk.json thresholds
    if (input.amount > 100000 || input.existingLoans >= 3 || input.termMonths > 60) {
      return { riskTier: 'HIGH' };
    }
    if (input.amount > 50000 || input.existingLoans >= 1 || input.termMonths > 36) {
      return { riskTier: 'MEDIUM' };
    }
    return { riskTier: 'LOW' };
  }
}
