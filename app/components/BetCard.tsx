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
    creator: { username: string };
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
  onUpdate: (betId: string, type: 'bid' | 'ask' | 'notional', value: number) => void;
  onTrade: (betId: string, type: 'buy' | 'sell') => void;
  onSettle: (betId: string, result: boolean) => void;
  onDelete: (betId: string) => void;
}

export default function BetCard({ bet, onUpdate, onTrade, onSettle, onDelete }: BetCardProps) {
  const { currentProfile } = useUser();
  const userColor = USER_COLORS[currentProfile.username as Username];
  const [isEditingNotional, setIsEditingNotional] = React.useState(false);
  const [newNotional, setNewNotional] = React.useState(bet.notional);

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
    const newBid = Number((document.getElementById('bid-input') as HTMLInputElement).value);
    
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
    const newAsk = Number((document.getElementById('ask-input') as HTMLInputElement).value);
    
    if (newAsk <= currentBid) {
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

  const canSell = lastBidUpdate?.updater.username !== currentProfile.username;
  const canBuy = lastAskUpdate?.updater.username !== currentProfile.username;

  const handleNotionalUpdate = async () => {
    if (newNotional <= 0) {
      alert("Notional must be greater than 0");
      return;
    }
    try {
      const response = await fetch(`/api/bets/${bet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notional',
          value: newNotional,
          updaterName: currentProfile.username
        })
      });
      if (!response.ok) throw new Error('Failed to update notional');
      const updatedBet = await response.json();
      onUpdate(bet.id, 'notional', newNotional);
      setIsEditingNotional(false);
    } catch (error) {
      console.error('Error updating notional:', error);
      alert('Failed to update notional');
    }
  };

  const currentBid = lastBidUpdate?.newBid ?? bet.currentBid;
  const currentAsk = lastAskUpdate?.newAsk ?? bet.currentAsk;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{bet.eventName}</h3>
          <p className="text-sm text-gray-500">Created by {bet.creator.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {isEditingNotional ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newNotional}
                  onChange={(e) => setNewNotional(Number(e.target.value))}
                  className="w-24 p-1 border rounded"
                  min="1"
                />
                <button
                  onClick={handleNotionalUpdate}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingNotional(false)}
                  className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                onClick={() => !bet.isTraded && setIsEditingNotional(true)}
                className={`cursor-pointer ${!bet.isTraded && 'hover:text-blue-500'}`}
              >
                {bet.notional}⚜️
              </div>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            title="Delete bet"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <input
              id="bid-input"
              type="number"
              defaultValue={currentBid}
              className="w-20 p-2 border rounded"
              placeholder="Bid"
              disabled={bet.isTraded}
            />
            <button
              onClick={handleBidUpdate}
              disabled={bet.isTraded}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Update Bid
            </button>
          </div>
          <div className="flex-1 flex gap-2">
            <input
              id="ask-input"
              type="number"
              defaultValue={currentAsk}
              className="w-20 p-2 border rounded"
              placeholder="Ask"
              disabled={bet.isTraded}
            />
            <button
              onClick={handleAskUpdate}
              disabled={bet.isTraded}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Update Ask
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {canSell && (
            <button
              onClick={() => onTrade(bet.id, 'sell')}
              disabled={bet.isTraded}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
            >
              Sell to {lastBidUpdate?.updater.username || '...'}
            </button>
          )}
          {canBuy && (
            <button
              onClick={() => onTrade(bet.id, 'buy')}
              disabled={bet.isTraded}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Buy from {lastAskUpdate?.updater.username || '...'}
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {/* ... price updates section stays the same ... */}
      </div>

      {/* Trade Details */}
      {bet.isTraded && lastTrade && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold mb-2">Trade Details</h4>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Buyer:</span> {lastTrade.buyer.username}
            </p>
            <p>
              <span className="font-medium">Seller:</span> {lastTrade.seller.username}
            </p>
            <p>
              <span className="font-medium">Trade:</span> {lastTrade.taker.username} hit {lastTrade.maker.username}'s {lastTrade.buyer.username === lastTrade.taker.username ? 'ask' : 'bid'}
            </p>
            <p>
              <span className="font-medium">Price:</span> {lastTrade.price}
            </p>
            <p>
              <span className="font-medium">Notional:</span> {bet.notional}⚜️
            </p>
          </div>
        </div>
      )}

      {bet.isTraded && !bet.isSettled && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-lg font-semibold mb-2">Settle Bet</h4>
          <p className="text-sm text-gray-600 mb-4">Did the event happen?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onSettle(bet.id, true)}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Yes
            </button>
            <button
              onClick={() => onSettle(bet.id, false)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              No
            </button>
          </div>
        </div>
      )}

      {bet.isTraded && bet.isSettled && lastTrade && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold">Settlement</h4>
          <p className="text-gray-600 mb-2">
            {bet.eventName} - {bet.eventResult ? '✅ YES' : '❌ NO'}
          </p>
          <p className="text-gray-700">
            {bet.eventResult ? (
              `${lastTrade.seller.username} owes ${lastTrade.buyer.username} ${(bet.notional * (100 - lastTrade.price) / 100).toFixed(2)}⚜️`
            ) : (
              `${lastTrade.buyer.username} owes ${lastTrade.seller.username} ${(bet.notional * lastTrade.price / 100).toFixed(2)}⚜️`
            )}
          </p>
        </div>
      )}
    </div>
  );
} 