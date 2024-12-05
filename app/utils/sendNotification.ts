import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import { prisma } from '../lib/prisma';

interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
}

webpush.setVapidDetails(
  'https://tightentrade-tan.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(title: string, body: string, url: string, actions?: any[]) {
  try {
    console.log('=== NOTIFICATION START ===');
    console.log('Sending notification:', { title, body, url });
    
    const subscriptions = await prisma.pushSubscription.findMany();
    console.log(`Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      console.log('No subscriptions found');
      return;
    }

    for (const subscription of subscriptions) {
      try {
        console.log(`Sending to: ${subscription.endpoint.slice(0, 50)}...`);
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
        console.log('Successfully sent notification');
      } catch (error: any) {
        console.error('Failed to send notification:', error.message);
        if (error.statusCode === 410) {
          console.log('Removing expired subscription');
          await prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint }
          });
        }
      }
    }
    console.log('=== NOTIFICATION END ===');
  } catch (error) {
    console.error('Notification error:', error);
  }
} 