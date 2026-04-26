export type NotificationPayload = {
  channel: 'push' | 'email' | 'webhook';
  title: string;
  body: string;
  tenantId: string;
};

export function defaultNotificationProvider(): string {
  return 'firebase';
}
