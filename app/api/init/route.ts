import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    // Create initial users if they don't exist
    await Promise.all([
      prisma.user.upsert({
        where: { username: 'Tejesh' },
        update: {},
        create: { 
          id: 'tejesh-id',  // Add a fixed ID
          username: 'Tejesh' 
        }
      }),
      prisma.user.upsert({
        where: { username: 'Manu' },
        update: {},
        create: { 
          id: 'manu-id',    // Add a fixed ID
          username: 'Manu' 
        }
      }),
      prisma.user.upsert({
        where: { username: 'Prakhar' },
        update: {},
        create: { 
          id: 'prakhar-id', // Add a fixed ID
          username: 'Prakhar' 
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Init Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 