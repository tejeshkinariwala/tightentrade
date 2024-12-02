'use client';

import { createContext, useContext } from 'react';
import { USER_COLORS, Username } from '../constants/userColors';

type ThemeContextType = {
  setThemeColor: (username: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setThemeColor = (username: string) => {
    const userColor = USER_COLORS[username as Username];
    const bgColor = {
      'from-blue-50/50': 'rgb(239 246 255 / 0.5)',
      'from-orange-50/50': 'rgb(255 247 237 / 0.5)',
      'from-purple-50/50': 'rgb(250 245 255 / 0.5)',
    }[userColor.background];
    
    document.documentElement.style.setProperty('--page-background', bgColor);
  };

  return (
    <ThemeContext.Provider value={{ setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 