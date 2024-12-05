import { NextResponse } from 'next/server'
import { prisma, TransactionClient } from '../../../../lib/prisma'
import type { PrismaClient } from '.prisma/client'
import { notifyClients } from '../../../../lib/notify'
import { sendNotification } from '../../../../utils/sendNotification'

export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { type, username } = data

    const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
      include: {
        priceUpdates: {
          include: {
            updater: true,
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    if (!bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    if (bet.isTraded) {
      return NextResponse.json(
        { error: 'Bet already traded' },
        { status: 400 }
      )
    }

    const lastBidUpdate = bet.priceUpdates.find(update => update.newBid !== null)
    const lastAskUpdate = bet.priceUpdates.find(update => update.newAsk !== null)

    if (type === 'buy' && !lastAskUpdate) {
      return NextResponse.json({ error: 'No ask available' }, { status: 400 })
    }

    if (type === 'sell' && !lastBidUpdate) {
      return NextResponse.json({ error: 'No bid available' }, { status: 400 })
    }

    const [trade, updatedBet] = await prisma.$transaction(async (prisma) => {
      const trade = await prisma.trade.create({
        data: {
          bet: { connect: { id: params.id } },
          buyer: {
            connect: { 
              username: type === 'buy' ? formattedUsername : lastBidUpdate!.updater.username 
            }
          },
          seller: {
            connect: { 
              username: type === 'buy' ? lastAskUpdate!.updater.username : formattedUsername 
            }
          },
          maker: {
            connect: { 
              username: type === 'buy' ? lastAskUpdate!.updater.username : lastBidUpdate!.updater.username 
            }
          },
          taker: {
            connect: { username: formattedUsername }
          },
          price: type === 'buy' ? bet.currentAsk : bet.currentBid
        },
        include: {
          buyer: true,
          seller: true,
          maker: true,
          taker: true
        }
      })

      const updatedBet = await prisma.bet.update({
        where: { id: params.id },
        data: { isTraded: true }
      })

      return [trade, updatedBet]
    })

    const tradeDescription = `Trade executed: 
      ${trade.buyer.username} bought from ${trade.seller.username} at ${trade.price}
      (${trade.taker.username} hit ${trade.maker.username}'s ${type === 'buy' ? 'ask' : 'bid'})`

    await notifyClients()
    console.log('Sending trade notification...')
    await sendNotification(
      'Trade Executed',
      `${trade.taker.username} ${type === 'buy' ? 'bought from' : 'sold to'} ${trade.maker.username} at ${trade.price}⚜️ (${bet.eventName})`,
      `/bets/${bet.id}`
    )
    console.log('Trade notification sent')

    return NextResponse.json({ 
      trade: {
        ...trade,
        description: tradeDescription
      }, 
      bet: updatedBet 
    })
  } catch (error) {
    console.error('Trade Error:', error)
    return NextResponse.json({ 
      error: String(error),
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 