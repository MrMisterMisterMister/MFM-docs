/**
 * Server-Sent Events (SSE) endpoint for real-time sensor data
 *
 * Streams new sensor readings to connected clients as they arrive
 */

import type { APIRoute } from 'astro';
import { dataStore } from '../../lib/dataStore';

export const GET: APIRoute = async () => {
  let keepAlive: NodeJS.Timeout;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
  async start(controller) {
      const encoder = new TextEncoder();

      console.log('SSE client connected');

      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Send recent readings as history (async call to KV)
      const recentReadings = await dataStore.getRecentReadings(50);
      const historyMessage = `data: ${JSON.stringify({ type: 'history', readings: recentReadings })}\n\n`;
      controller.enqueue(encoder.encode(historyMessage));
      console.log(`SSE sent history: ${recentReadings.length} readings`);

      // Subscribe to new readings
      unsubscribe = dataStore.subscribe((event) => {
  try {
          if (event.type === 'reading') {
      const message = `data: ${JSON.stringify({ type: 'reading', reading: event.data })}\n\n`;
      controller.enqueue(encoder.encode(message));
      console.log('SSE sent new reading:', event.data.devEui, 'revolutions:', event.data.revolutions);
          } else if (event.type === 'device') {
      const message = `data: ${JSON.stringify({ type: 'device', device: event.data })}\n\n`;
      controller.enqueue(encoder.encode(message));
      console.log('SSE sent device update:', event.data.devEui, 'location:', event.data.locationCity);
          }
  } catch (error) {
          console.error('Error sending SSE message:', error);
  }
      });
      console.log('SSE subscribed to dataStore');

      // Keep-alive ping every 30 seconds
      keepAlive = setInterval(() => {
  try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
  } catch (error) {
          clearInterval(keepAlive);
  }
      }, 30000);
  },
  cancel() {
      console.log('SSE client disconnected');
      if (keepAlive) {
  clearInterval(keepAlive);
      }
      if (unsubscribe) {
  unsubscribe();
      }
  },
  });

  return new Response(stream, {
  headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
  },
  });
};
