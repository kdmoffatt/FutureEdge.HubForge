import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, type MessagingPayload } from 'firebase-admin/messaging';

type PushRequest = {
  token: string;
  notification: { title: string; body: string };
  data: Record<string, string> | undefined;
};

function shouldUseFirebaseProvider(): boolean {
  const provider = process.env['NOTIFICATION_PROVIDER'] ?? 'firebase';
  return provider.toLowerCase() === 'firebase';
}

function ensureFirebaseApp(): void {
  if (!shouldUseFirebaseProvider() || getApps().length > 0) {
    return;
  }

  const projectId = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  const privateKey = process.env['FIREBASE_PRIVATE_KEY']?.replace(/\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    return;
  }

  initializeApp({ credential: applicationDefault() });
}

export async function sendPushNotification(input: PushRequest): Promise<string> {
  if (!shouldUseFirebaseProvider()) {
    throw new Error('Only firebase provider is currently implemented in runtime dispatch.');
  }

  ensureFirebaseApp();

  const message: MessagingPayload & { token: string } = {
    token: input.token,
    notification: input.notification,
    ...(input.data ? { data: input.data } : {}),
  };

  return getMessaging().send(message as never);
}
