export class SendNotificationCommand {
  constructor(
    public readonly userId: string,
    public readonly channel: 'EMAIL' | 'SMS' | 'PUSH',
    public readonly type: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}
