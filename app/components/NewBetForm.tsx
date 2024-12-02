'use client';

import { useState } from 'react';
import { UserColor } from '../constants/userColors';

interface NewBetFormProps {
  onClose: () => void;
  onSubmit: (data: { eventName: string; notional: number }) => void;
  userColor: UserColor;
}

export default function NewBetForm({ onClose, onSubmit, userColor }: NewBetFormProps) {
  const [eventName, setEventName] = useState('');
  const [notional, setNotional] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ eventName, notional });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-2xl font-bold"
                style={{ color: userColor.primary }}
              >
                Create New Bet
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent transition-all text-lg font-medium"
                  style={{ 
                    '--tw-ring-color': userColor.primary,
                    '--tw-ring-opacity': 0.5 
                  } as React.CSSProperties}
                  placeholder="e.g., Will it rain tomorrow?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notional Amount ($)
                </label>
                <input
                  type="number"
                  value={notional}
                  onChange={(e) => setNotional(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:border-transparent transition-all text-lg font-medium"
                  style={{ 
                    '--tw-ring-color': userColor.primary,
                    '--tw-ring-opacity': 0.5 
                  } as React.CSSProperties}
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                  style={{ 
                    backgroundColor: userColor.primary,
                    '--tw-hover-bg-opacity': 0.9 
                  } as React.CSSProperties}
                >
                  Create Bet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 