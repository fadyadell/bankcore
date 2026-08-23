import { Injectable, Logger } from '@nestjs/common';


export interface RiskEvaluationRequest {
  loanAmount: number;
  monthlyIncome: number;
  creditScore: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskEvaluationResult {
  riskLevel: RiskLevel;
  score: number;
  reasons: string[];
}

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  async evaluateLoanRisk(request: RiskEvaluationRequest): Promise<RiskEvaluationResult> {
    this.logger.log(`Evaluating loan risk via GoRules for amount: ${request.loanAmount}`);
    
    // In a real implementation, this would call the GoRules endpoint:
    /*
    try {
      const response = await axios.post(
        this.gorulesUrl,
        { context: request },
        { headers: { 'X-API-Key': this.gorulesApiKey } }
      );
      return response.data.result;
    } catch (error) {
      this.logger.error('Failed to evaluate risk via GoRules', error);
      throw error;
    }
    */

    // MOCK IMPLEMENTATION FOR POC if GoRules is not reachable
    let score = 100;
    const reasons: string[] = [];

    if (request.creditScore < 600) {
      score -= 40;
      reasons.push('Low credit score');
    } else if (request.creditScore > 750) {
      score += 20;
    }

    const dti = request.loanAmount / (request.monthlyIncome * 12);
    if (dti > 0.5) {
      score -= 30;
      reasons.push('High debt-to-income ratio');
    }

    let riskLevel: RiskLevel = 'MEDIUM';
    if (score >= 90) riskLevel = 'LOW';
    else if (score < 60) riskLevel = 'HIGH';

    this.logger.log(`Evaluated risk: ${riskLevel} (Score: ${score})`);
    return { riskLevel, score, reasons };
  }
}
