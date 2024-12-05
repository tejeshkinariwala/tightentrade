import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import type { PrismaClient } from '.prisma/client'
import { notifyClients } from '../../../lib/notify'
import { sendNotification } from '../../../utils/sendNotification'

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export const runtime = 'nodejs'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { type, value, updaterName } = data;

    const existingBet = await prisma.bet.findUnique({
      where: { id: params.id }
    });

    if (!existingBet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }

    if (type === 'notional') {
      const updatedBet = await prisma.bet.update({
        where: { id: params.id },
        data: { notional: value },
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
        }
      });
      return NextResponse.json(updatedBet);
    }

    // First check if bet exists and is not traded
    if (existingBet.isTraded) {
      return NextResponse.json({ error: 'Cannot update traded bet' }, { status: 400 });
    }
    // Update the bet and create price update in a transaction
    const updatedBet = await prisma.$transaction(async (prisma: TransactionClient) => {
      // First update the bet
      const bet = await prisma.bet.update({
        where: { id: params.id },
        data: {
          [type === 'bid' ? 'currentBid' : 'currentAsk']: value,
        }
      });

      // Then create the price update
      await prisma.priceUpdate.create({
        data: {
          bet: { connect: { id: params.id } },
          updater: {
            connectOrCreate: {
              where: { username: updaterName },
              create: { username: updaterName }
            }
          },
          [type === 'bid' ? 'newBid' : 'newAsk']: value,
          timestamp: new Date().toISOString(),
        }
      });

      // Finally fetch the updated bet with all relations
      return prisma.bet.findUnique({
        where: { id: params.id },
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
        }
      });
    });

    await notifyClients();
    await sendNotification(
      'Price Update',
      `${updaterName} ${type === 'bid' ? 'raised bid to' : 'lowered ask to'} ${value}⚜️ on ${existingBet.eventName}`,
      `/bets/${existingBet.id}`
    );
    return NextResponse.json(updatedBet);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ 
      error: String(error),
      details: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if bet exists
    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
      include: {
        trades: true,
        priceUpdates: true,
      }
    });

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }
    // Delete in a transaction to ensure all related records are deleted
    await prisma.$transaction(async (tx) => {
      // Delete trades first if they exist
      if (bet.trades.length > 0) {
        await tx.trade.deleteMany({
          where: { betId: params.id }
        });
      }

      // Delete price updates
      await tx.priceUpdate.deleteMany({
        where: { betId: params.id }
      });

      // Finally delete the bet
      await tx.bet.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ 
      error: String(error),
      details: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
} 