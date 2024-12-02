'use client';

import React, { createContext, useContext, useState } from 'react';

type Profile = {
  username: string;
  letter: string;
};

const defaultProfile = { username: 'Tejesh', letter: 'T' };
const profiles = [
  { username: 'Tejesh', letter: 'T' },
  { username: 'Manu', letter: 'M' },
  { username: 'Prakhar', letter: 'P' },
];

type UserContextType = {
  currentProfile: Profile;
  setCurrentProfile: (profile: Profile) => void;
  profiles: Profile[];
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultProfile);

  return (
    <UserContext.Provider value={{ 
      currentProfile, 
      setCurrentProfile, 
      profiles: profiles 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 