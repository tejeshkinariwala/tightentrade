'use client';

import React from 'react';
import { useUser } from '../contexts/UserContext';
import { USER_COLORS, Username } from '../constants/userColors';

interface BetCardProps {
  bet: {
    id: string;
    eventName: string;
    notional: number;
    currentBid: number;
    currentAsk: number;
    isTraded: boolean;
    isSettled: boolean;
    eventResult?: boolean;
    trades: Array<{
      buyer: { username: string };
      seller: { username: string };
      maker: { username: string };
      taker: { username: string };
      price: number;
    }>;
    priceUpdates: Array<{
      updater: { username: string };
      newBid?: number;
      newAsk?: number;
      timestamp: string;
    }>;
  };
  onUpdate: (betId: string, type: 'bid' | 'ask', value: number) => void;
  onTrade: (betId: string, type: 'buy' | 'sell') => void;
  onSettle: (betId: string, result: boolean) => void;
  onDelete: (betId: string) => void;
}

export default function BetCard({ bet, onUpdate, onTrade, onSettle, onDelete }: BetCardProps) {
  const { currentProfile } = useUser();
  const userColor = USER_COLORS[currentProfile.username as Username];
  const [newBid, setNewBid] = React.useState(bet.currentBid);
  const [newAsk, setNewAsk] = React.useState(bet.currentAsk);

  const lastBidUpdate = bet.priceUpdates
    .filter(update => update.newBid !== null)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const lastAskUpdate = bet.priceUpdates
    .filter(update => update.newAsk !== null)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const lastTrade = bet.trades[bet.trades.length - 1];

  const calculateMinIncrement = () => {
    const spread = bet.currentAsk - bet.currentBid;
    return Math.min(Math.max(0.5, spread * 0.2), 5);
  };

  const handleBidUpdate = () => {
    const minIncrement = calculateMinIncrement();
    const minValidBid = bet.currentBid + minIncrement;
    
    if (newBid < minValidBid) {
      alert(`New bid must be at least ${minIncrement} above current bid (${minValidBid})`);
      return;
    }
    if (newBid >= bet.currentAsk) {
      alert("New bid must be lower than current ask");
      return;
    }
    onUpdate(bet.id, 'bid', newBid);
  };

  const handleAskUpdate = () => {
    const minIncrement = calculateMinIncrement();
    const maxValidAsk = bet.currentAsk - minIncrement;
    
    if (newAsk > maxValidAsk) {
      alert(`New ask must be at least ${minIncrement} below current ask (${maxValidAsk})`);
      return;
    }
    if (newAsk <= bet.currentBid) {
      alert("New ask must be higher than current bid");
      return;
    }
    onUpdate(bet.id, 'ask', newAsk);
  };

  const handleDelete = () => {
    if (bet.isTraded) {
      if (!window.confirm('This bet has been traded. Are you sure you want to delete it?')) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to delete this bet?')) {
        return;
      }
    }
    onDelete(bet.id);
  };

  return (
    <div className="test-card">
      <div className={`
        bg-white
        rounded-xl
        p-8
        shadow-lg
        hover:shadow-2xl
        transition-all
        duration-300
        border
        border-gray-200
        hover:border-${userColor.primary}
        transform
        hover:-translate-y-1
        ${!bet.isTraded ? `bg-gradient-to-br from-white to-${userColor.gradient}` : 'bg-gradient-to-br from-gray-50 to-gray-100'}
      `}>
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: userColor.primary }}
          >
            {bet.eventName}
          </h2>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="space-y-8">
          <p className="text-gray-600 font-medium text-lg">
            Notional: <span style={{ color: userColor.primary }} className="font-semibold">${bet.notional}</span>
          </p>
          
          {!bet.isTraded ? (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-6">
                  <p className="text-gray-700 font-medium mb-3">
                    Bid: <span style={{ color: userColor.primary }} className="font-semibold text-lg">{bet.currentBid}</span>
                    {lastBidUpdate && 
                      <span className="text-sm ml-2 text-gray-500">
                        (by {lastBidUpdate.updater.username})
                      </span>
                    }
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={newBid}
                      onChange={(e) => setNewBid(Number(e.target.value))}
                      className={`w-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent text-lg font-medium`}
                      style={{ 
                        '--tw-ring-color': userColor.primary,
                        '--tw-ring-opacity': 0.5 
                      } as React.CSSProperties}
                      min={bet.currentBid + calculateMinIncrement()}
                      max={bet.currentAsk}
                      step={0.5}
                    />
                    <button
                      onClick={handleBidUpdate}
                      className="text-white px-4 py-3 rounded-lg transition-colors font-medium"
                      style={{ 
                        backgroundColor: userColor.primary,
                        '--tw-hover-bg-opacity': 0.9 
                      } as React.CSSProperties}
                    >
                      Update
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onTrade(bet.id, 'sell')}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-medium min-w-[180px] text-center"
                >
                  {`Sell to ${lastBidUpdate?.updater.username || 'N/A'} at ${bet.currentBid}`}
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex-1 mr-6">
                  <p className="text-gray-700 font-medium mb-3">
                    Ask: <span style={{ color: userColor.primary }} className="font-semibold text-lg">{bet.currentAsk}</span>
                    {lastAskUpdate && 
                      <span className="text-sm ml-2 text-gray-500">
                        (by {lastAskUpdate.updater.username})
                      </span>
                    }
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={newAsk}
                      onChange={(e) => setNewAsk(Number(e.target.value))}
                      className={`w-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent text-lg font-medium`}
                      style={{ 
                        '--tw-ring-color': userColor.primary,
                        '--tw-ring-opacity': 0.5 
                      } as React.CSSProperties}
                      min={bet.currentBid}
                      max={bet.currentAsk - calculateMinIncrement()}
                      step={0.5}
                    />
                    <button
                      onClick={handleAskUpdate}
                      className="text-white px-4 py-3 rounded-lg transition-colors font-medium"
                      style={{ 
                        backgroundColor: userColor.primary,
                        '--tw-hover-bg-opacity': 0.9 
                      } as React.CSSProperties}
                    >
                      Update
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onTrade(bet.id, 'buy')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-medium min-w-[180px] text-center"
                >
                  {`Buy from ${lastAskUpdate?.updater.username || 'N/A'} at ${bet.currentAsk}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold" style={{ color: userColor.primary }}>
                  Trade Details
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Buyer: <span className="font-medium">{lastTrade.buyer.username}</span></p>
                  <p className="text-gray-700">Seller: <span className="font-medium">{lastTrade.seller.username}</span></p>
                  <p className="text-gray-700">Price: <span className="font-medium">{lastTrade.price}</span></p>
                  <p className="text-gray-600 text-sm mt-3">
                    {lastTrade.taker.username} hit {lastTrade.maker.username}'s {lastTrade.maker.username === lastTrade.seller.username ? 'ask' : 'bid'}
                  </p>
                </div>
              </div>

              {!bet.isSettled ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => onSettle(bet.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                  >
                    Event Happened
                  </button>
                  <button
                    onClick={() => onSettle(bet.id, false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                  >
                    Event Did Not Happen
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-3">
                    Result: {bet.eventResult ? (
                      <span className="text-green-600">Event Happened</span>
                    ) : (
                      <span className="text-red-600">Event Did Not Happen</span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    {bet.eventResult ? (
                      `${lastTrade.seller.username} owes ${lastTrade.buyer.username} $${(bet.notional * (100 - lastTrade.price) / 100).toFixed(2)}`
                    ) : (
                      `${lastTrade.buyer.username} owes ${lastTrade.seller.username} $${(bet.notional * lastTrade.price / 100).toFixed(2)}`
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 