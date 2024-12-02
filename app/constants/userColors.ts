export const USER_COLORS = {
  Tejesh: {
    primary: '#2563EB', // Blue
    gradient: 'blue-50',
    background: 'from-blue-50/50',
    active: 'bg-gradient-to-br from-blue-400 to-blue-500',
    hover: 'hover:bg-blue-600',
  },
  Manu: {
    primary: '#F97316', // Orange
    gradient: 'orange-50',
    background: 'from-orange-50/50',
    active: 'bg-gradient-to-br from-orange-400 to-orange-500',
    hover: 'hover:bg-orange-600',
  },
  Prakhar: {
    primary: '#9333EA', // Purple
    gradient: 'purple-50',
    background: 'from-purple-50/50',
    active: 'bg-gradient-to-br from-purple-400 to-purple-500',
    hover: 'hover:bg-purple-600',
  },
} as const;

export type Username = keyof typeof USER_COLORS;

export type UserColor = typeof USER_COLORS[Username]; 