export class LoanAppliedEvent {
  constructor(
    public readonly loanId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
