import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode('event: ping\ndata: {}\n\n'));
      }, 30000);

      // Clean up on close
      return () => {
        clearInterval(keepAlive);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 