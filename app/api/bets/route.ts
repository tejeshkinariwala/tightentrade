import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET() {
  try {
    const bets = await prisma.bet.findMany({
      include: {
        creator: true,
        trades: {
          include: {
            buyer: true,
            seller: true,
            maker: true,
            taker: true,
          },
        },
        priceUpdates: {
          include: {
            updater: true,
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bets);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { eventName, notional, creatorName } = data;

    // First create the user if they don't exist
    const user = await prisma.user.upsert({
      where: { username: creatorName },
      update: {},
      create: { username: creatorName }
    });

    // Then create the bet with initial price updates
    const bet = await prisma.bet.create({
      data: {
        eventName,
        notional,
        currentBid: 0,
        currentAsk: 100,
        creator: {
          connect: { id: user.id }
        },
        priceUpdates: {
          create: [
            {
              newBid: 0,
              updaterId: user.id,
              timestamp: new Date()
            },
            {
              newAsk: 100,
              updaterId: user.id,
              timestamp: new Date()
            }
          ]
        }
      },
      include: {
        creator: true,
        trades: {
          include: {
            buyer: true,
            seller: true,
            maker: true,
            taker: true,
          },
        },
        priceUpdates: {
          include: {
            updater: true,
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 