import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { result } = data;

    const bet = await prisma.bet.update({
      where: { id: params.id },
      data: {
        isSettled: true,
        eventResult: result,
      },
      include: {
        trades: {
          include: {
            buyer: true,
            seller: true,
            maker: true,
            taker: true,
          },
        },
      },
    });

    const lastTrade = bet.trades[bet.trades.length - 1];
    
    // If event happened:
    //   - seller owes buyer (100 - price)% of notional
    //   - because seller bet against event happening and lost
    // If event didn't happen:
    //   - buyer owes seller price% of notional
    //   - because buyer bet on event happening and lost
    const amountOwed = bet.notional * (result ? (100 - lastTrade.price) : lastTrade.price) / 100;
    const owedBy = result ? lastTrade.seller.username : lastTrade.buyer.username;
    const owedTo = result ? lastTrade.buyer.username : lastTrade.seller.username;

    const settlementDescription = `${owedBy} owes ${owedTo} $${amountOwed.toFixed(2)}`;

    return NextResponse.json({
      bet,
      settlement: {
        amount: amountOwed,
        owedBy,
        owedTo,
        description: settlementDescription
      }
    });
  } catch (error) {
    console.error('Settlement Error:', error);
    return NextResponse.json({
      error: String(error),
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 