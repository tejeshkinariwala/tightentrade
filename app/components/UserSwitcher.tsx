'use client';

import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { USER_COLORS, Username } from '../constants/userColors';
import Avatar from './Avatar';
import { useEffect } from 'react';

interface Trade {
  buyer: { username: string };
  seller: { username: string };
  price: number;
  bet: {
    notional: number;
    eventResult: boolean | null;
  };
}

function calculateUserWinnings(username: string, trades: Trade[]): number {
  console.log('Calculating winnings for:', username);
  
  return trades.reduce((total, trade) => {
    console.log('Processing trade in calculation:', {
      trade,
      buyerUsername: trade.buyer.username,
      sellerUsername: trade.seller.username,
      tradeUsername: username.charAt(0).toUpperCase() + username.slice(1).toLowerCase(),
      eventResult: trade.bet.eventResult,
      notional: trade.bet.notional,
      price: trade.price
    });

    if (trade.bet.eventResult === null) {
      console.log('Skipping trade - no result');
      return total;
    }
    
    let amount = 0;
    const tradeUsername = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    
    if (trade.buyer.username === tradeUsername) {
      amount = trade.bet.eventResult ? 
        trade.bet.notional * (100 - trade.price) / 100 :
        -trade.bet.notional * trade.price / 100;
      console.log('Buyer calculation:', { amount });
    } else if (trade.seller.username === tradeUsername) {
      amount = trade.bet.eventResult ?
        -trade.bet.notional * (100 - trade.price) / 100 :
        trade.bet.notional * trade.price / 100;
      console.log('Seller calculation:', { amount });
    } else {
      console.log('User not involved in trade');
    }

    console.log('Running total:', total + amount);
    return total + amount;
  }, 0);
}

interface UserSwitcherProps {
  bets: Array<{
    id: string;
    isSettled: boolean;
    isTraded: boolean;
    eventResult?: boolean;
    notional: number;
    trades: Array<{
      buyer: { username: string };
      seller: { username: string };
      price: number;
    }>;
  }>;
}

export default function UserSwitcher({ bets }: UserSwitcherProps) {
  const { currentProfile, setCurrentProfile, profiles } = useUser();
  const { setThemeColor } = useTheme();

  useEffect(() => {
    setThemeColor(currentProfile.username);
  }, [currentProfile.username, setThemeColor]);

  const handleProfileChange = (profile: { username: string; letter: string }) => {
    console.log('Switching to profile:', profile.username);
    setCurrentProfile(profile);
  };

  // Add debug logs
  const settledTrades = bets.flatMap(bet => 
    bet.isSettled ? bet.trades.map(trade => {
      console.log('Processing trade:', {
        bet,
        trade,
        eventResult: bet.eventResult,
        isSettled: bet.isSettled
      });
      return ({ 
        ...trade, 
        bet: { 
          notional: bet.notional, 
          eventResult: bet.eventResult ?? null 
        } 
      });
    }) : []
  );

  console.log('Current user:', currentProfile.username);
  console.log('Settled trades:', settledTrades);

  const winnings = calculateUserWinnings(currentProfile.username, settledTrades);
  console.log('Calculated winnings:', winnings);

  const calculateBalance = (username: string) => {
    let balance = 0;
    bets.forEach(bet => {
      if (!bet.isTraded || !bet.isSettled) return;
      const trade = bet.trades[bet.trades.length - 1];
      if (trade.buyer.username === username) {
        balance += bet.eventResult ? 
          (bet.notional * (100 - trade.price) / 100) : 
          -(bet.notional * trade.price / 100);
      }
      if (trade.seller.username === username) {
        balance += bet.eventResult ? 
          -(bet.notional * (100 - trade.price) / 100) : 
          (bet.notional * trade.price / 100);
      }
    });
    return `${balance.toFixed(2)}⚜️`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        <span className="text-gray-700 text-lg">
          Playing as{' '}
          <span 
            className="font-bold text-xl"
            style={{ color: USER_COLORS[currentProfile.username as Username].primary }}
          >
            {currentProfile.username}
          </span>
        </span>
        <span className={`text-lg font-semibold mt-1 ${winnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {winnings >= 0 ? '+' : ''}{winnings.toFixed(2)}$
        </span>
      </div>
      <div className="flex items-center gap-8">
        {profiles.map((profile) => (
          <div 
            key={profile.username} 
            className="relative group"
            style={{ minWidth: '64px' }}
          >
            <div 
              onClick={() => handleProfileChange(profile)}
              className="transform transition-transform group-hover:-translate-y-1 cursor-pointer"
            >
              <Avatar 
                username={profile.username}
                size="lg"
                isActive={currentProfile.username === profile.username}
              />
            </div>
            <span 
              className="
                absolute -bottom-8 left-1/2 -translate-x-1/2
                text-base font-semibold whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity
              "
              style={{ color: USER_COLORS[profile.username as Username].primary }}
            >
              {profile.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 