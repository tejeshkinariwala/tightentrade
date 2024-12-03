import { NextResponse } from 'next/server';

export const runtime = 'edge';

let clients = new Set<ReadableStreamDefaultController<Uint8Array>>();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
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
        clients.delete(controller);
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

export async function POST() {
  const encoder = new TextEncoder();
  clients.forEach(client => {
    client.enqueue(encoder.encode('event: refresh\ndata: {}\n\n'));
  });
  
  return NextResponse.json({ success: true });
} 