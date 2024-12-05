import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import { prisma } from '../lib/prisma';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

webpush.setVapidDetails(
  'https://tightentrade-tan.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(title: string, body: string, url: string, actions?: any[]) {
  try {
    console.log('Starting notification send:', { title, body, url });
    const subscriptions = await prisma.pushSubscription.findMany() as PushSubscriptionData[];
    console.log('Found subscriptions:', subscriptions.length);

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return;
    }

    for (const subscription of subscriptions) {
      try {
        console.log('Sending to subscription:', subscription.endpoint);
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
        console.log('Successfully sent to:', subscription.endpoint);
      } catch (error) {
        console.error('Error sending to subscription:', error);
        if ((error as any).statusCode === 410) {
          console.log('Removing invalid subscription:', subscription.endpoint);
          await prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
} 