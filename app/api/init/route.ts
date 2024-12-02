export const runtime = 'nodejs'

import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    // Create initial users if they don't exist
    await Promise.all([
      prisma.user.upsert({
        where: { username: 'Tejesh' },
        update: {},
        create: { username: 'Tejesh' }
      }),
      prisma.user.upsert({
        where: { username: 'Manu' },
        update: {},
        create: { username: 'Manu' }
      }),
      prisma.user.upsert({
        where: { username: 'Prakhar' },
        update: {},
        create: { username: 'Prakhar' }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Init Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 