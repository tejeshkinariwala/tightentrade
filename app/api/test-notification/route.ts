import { NextResponse } from 'next/server';
import { sendNotification } from '../../utils/sendNotification';

export async function GET() {
  try {
    console.log('Testing notification...');
    await sendNotification(
      'Test Notification',
      'This is a test notification',
      '/'
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: String(error) });
  }
} 