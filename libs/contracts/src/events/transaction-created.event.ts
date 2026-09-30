export class TransactionCreatedEvent {
  constructor(
    public readonly transactionId: string,
    // Identifies the customer for notification targeting
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly type: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
