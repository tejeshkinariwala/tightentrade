export const USER_COLORS = {
  tejesh: {
    primary: '#2563EB', // Blue
    gradient: 'from-blue-50 to-blue-100',
    background: 'from-blue-50/50 to-white',
    active: 'bg-gradient-to-br from-blue-400 to-blue-500',
    hover: 'hover:bg-blue-600',
  },
  manu: {
    primary: '#059669', // Emerald
    gradient: 'from-emerald-50 to-emerald-100',
    background: 'from-emerald-50/50 to-white',
    active: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
    hover: 'hover:bg-emerald-600',
  },
  prakhar: {
    primary: '#9333EA', // Purple
    gradient: 'from-purple-50 to-purple-100',
    background: 'from-purple-50/50 to-white',
    active: 'bg-gradient-to-br from-purple-400 to-purple-500',
    hover: 'hover:bg-purple-600',
  },
};

export type Username = keyof typeof USER_COLORS; 