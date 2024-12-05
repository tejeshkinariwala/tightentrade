import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

webpush.setVapidDetails(
  'https://tightentrade-tan.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(title: string, body: string, url: string, actions?: any[]) {
  const subscriptions = await prisma.pushSubscription.findMany();

  const notifications = subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        },
        JSON.stringify({
          title,
          body,
          url,
          actions
        })
      );
    } catch (error) {
      console.error('Error sending notification:', error);
      // Remove invalid subscriptions
      if ((error as any).statusCode === 410) {
        await prisma.pushSubscription.delete({
          where: { endpoint: subscription.endpoint }
        });
      }
    }
  });

  await Promise.all(notifications);
} 