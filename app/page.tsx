'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import BetCard from './components/BetCard';
import NewBetForm from './components/NewBetForm';
import UserSwitcher from './components/UserSwitcher';
import { useUser } from './contexts/UserContext';
import { USER_COLORS, Username } from './constants/userColors';

interface Bet {
  id: string;
  eventName: string;
  notional: number;
  currentBid: number;
  currentAsk: number;
  isTraded: boolean;
  isSettled: boolean;
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
}

export default function Home() {
  const { currentProfile } = useUser();
  const userColor = USER_COLORS[currentProfile.username as Username];
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewBetForm, setShowNewBetForm] = useState(false);

  const fetchBets = async () => {
    try {
      const response = await fetch('/api/bets');
      if (!response.ok) {
        throw new Error('Failed to fetch bets');
      }
      const data = await response.json();
      console.log('Fetched bets:', data);
      setBets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bets:', err);
      setError('Failed to load bets');
      setBets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetch('/api/init');
      fetchBets();
    };
    init();
  }, []);

  const handleUpdate = async (betId: string, type: 'bid' | 'ask', value: number) => {
    console.log('Updating bet:', { betId, type, value, profile: currentProfile.username });
    try {
      const response = await fetch(`/api/bets/${betId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          value, 
          updaterName: currentProfile.username 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Update failed:', data);
        alert(`Failed to update: ${data.error}`);
        return;
      }

      fetchBets();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update bet');
    }
  };

  const handleTrade = async (betId: string, type: 'buy' | 'sell') => {
    try {
      const response = await fetch(`/api/bets/${betId}/trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type,
          username: currentProfile.username 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Trade failed:', data);
        alert(`Failed to trade: ${data.error}`);
        return;
      }

      console.log('Trade executed:', data.trade.description);
      fetchBets();
    } catch (error) {
      console.error('Trade error:', error);
      alert('Failed to execute trade');
    }
  };

  const handleSettle = async (betId: string, result: boolean) => {
    try {
      const response = await fetch(`/api/bets/${betId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Settlement failed:', data);
        alert(`Failed to settle: ${data.error}`);
        return;
      }

      console.log('Settlement:', data.settlement.description);
      fetchBets();
    } catch (error) {
      console.error('Settlement error:', error);
      alert('Failed to settle bet');
    }
  };

  const handleNewBet = async (data: { eventName: string; notional: number }) => {
    try {
      console.log('Creating new bet:', data);
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          creatorName: currentProfile.username
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create bet:', errorData);
        alert(`Failed to create bet: ${errorData.error}`);
        return;
      }

      await fetchBets(); // Fetch updated list of bets
      setShowNewBetForm(false);
    } catch (error) {
      console.error('Failed to create bet:', error);
      alert('Failed to create bet');
    }
  };

  const handleDelete = async (betId: string) => {
    const response = await fetch(`/api/bets/${betId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchBets();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col items-center gap-12 mb-12">
          <h1 
            className="text-4xl font-bold text-center"
            style={{ color: userColor.primary }}
          >
            Betting Platform
          </h1>
          <UserSwitcher bets={bets} />
          <button
            onClick={() => setShowNewBetForm(true)}
            className="w-full sm:w-auto text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
            style={{ 
              backgroundColor: userColor.primary,
              '--tw-hover-bg-opacity': 0.9 
            } as React.CSSProperties}
          >
            Create New Bet
          </button>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : bets.length === 0 ? (
            <div className="text-center text-gray-600">No bets available</div>
          ) : (
            bets.map((bet) => (
              <BetCard
                key={bet.id}
                bet={bet}
                onUpdate={handleUpdate}
                onTrade={handleTrade}
                onSettle={handleSettle}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {showNewBetForm && (
          <NewBetForm
            onClose={() => setShowNewBetForm(false)}
            onSubmit={handleNewBet}
            userColor={userColor}
          />
        )}
      </div>
    </div>
  );
} 