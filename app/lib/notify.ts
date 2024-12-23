const BASE_URL = process.env.VERCEL_URL ? 
  `https://${process.env.VERCEL_URL}` : 
  'http://localhost:3000';

export async function notifyClients() {
  try {
    const response = await fetch(`${BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'refresh' }),
    });
    
    if (!response.ok) {
      console.error('Failed to notify clients');
    }
  } catch (error) {
    console.error('Error notifying clients:', error);
  }
} 