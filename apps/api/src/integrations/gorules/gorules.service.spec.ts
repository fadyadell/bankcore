import { Test, TestingModule } from '@nestjs/testing';
import { GoRulesService } from './gorules.service';
import { ServiceUnavailableException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('GoRulesService', () => {
  let service: GoRulesService;

  beforeEach(async () => {
    // Note: We need to ensure that __dirname resolution works in the test environment,
    // where it points to the src directory, not dist.
    // The service uses path.join(__dirname, 'loan-risk.json').
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoRulesService],
    }).compile();

    service = module.get<GoRulesService>(GoRulesService);
    
    // Simulate OnModuleInit
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return AUTO_APPROVE for low risk', async () => {
    const input = {
      loanAmount: 5000,
      termMonths: 12,
      monthlyIncome: 10000,
      existingLoanCount: 0,
      existingDebt: 0,
      accountBalance: 20000,
    };
    const result = await service.evaluateLoanRisk(input);
    expect(result.decision).toBe('AUTO_APPROVE');
    expect(result.riskLevel).toBe('LOW');
    expect(typeof result.riskScore).toBe('number');
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should return REVIEW for medium risk', async () => {
    const input = {
      loanAmount: 30000,
      termMonths: 36,
      monthlyIncome: 6000,
      existingLoanCount: 1,
      existingDebt: 8000,
      accountBalance: 5000,
    };
    const result = await service.evaluateLoanRisk(input);
    expect(result.decision).toBe('REVIEW');
    expect(result.riskLevel).toBe('MEDIUM');
    expect(typeof result.riskScore).toBe('number');
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should return REJECT for high risk', async () => {
    const input = {
      loanAmount: 80000,
      termMonths: 60,
      monthlyIncome: 3000,
      existingLoanCount: 3,
      existingDebt: 40000,
      accountBalance: 500,
    };
    const result = await service.evaluateLoanRisk(input);
    expect(result.decision).toBe('REJECT');
    expect(result.riskLevel).toBe('HIGH');
    expect(typeof result.riskScore).toBe('number');
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should throw ServiceUnavailableException on invalid rule output', async () => {
    // We mock the decision.evaluate temporarily to return invalid data
    jest.spyOn((service as any).decision, 'evaluate').mockResolvedValueOnce({
      result: {
        decision: 'INVALID_DECISION_ABC',
        riskLevel: 'LOW',
        riskScore: 20,
        reasons: [],
      }
    });

    const input = {
      loanAmount: 5000,
      termMonths: 12,
      monthlyIncome: 10000,
      existingLoanCount: 0,
      existingDebt: 0,
      accountBalance: 20000,
    };

    await expect(service.evaluateLoanRisk(input)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
