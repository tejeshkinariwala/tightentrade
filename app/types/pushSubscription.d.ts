declare namespace PrismaClient {
  interface PushSubscription {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt: Date;
  }
} 