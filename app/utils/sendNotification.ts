import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import { prisma } from '../lib/prisma';

// Cast prisma to any to bypass type checking
const db = prisma as any;

webpush.setVapidDetails(
  'https://tightentrade-tan.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(title: string, body: string, url: string, actions?: any[]) {
  try {
    console.log('=== NOTIFICATION START ===');
    console.log('Sending notification:', { title, body, url });
    
    const subscriptions = await db.pushSubscription.findMany();
    console.log(`Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      console.log('No subscriptions found - have you enabled notifications?');
      return;
    }

    for (const subscription of subscriptions) {
      try {
        console.log(`Attempting to send to subscription: ${subscription.endpoint}`);
        const result = await webpush.sendNotification(
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
        console.log('Push service response:', result);
      } catch (error: any) {
        console.error('Push service error:', {
          code: error.statusCode,
          message: error.message,
          body: error.body
        });
      }
    }
  } catch (error) {
    console.error('Top level notification error:', error);
  }
} 