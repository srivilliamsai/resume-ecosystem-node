// services/notification-service/src/main.ts
import Fastify from 'fastify';
import { startResumeConsumer, disconnectConsumer } from './consumers/resumeConsumer.js';
import { wsService } from './services/wsService.js';
import { emailService } from './services/emailService.js';

const app = Fastify({ logger: true });

// Environment check
const PORT = process.env.PORT || 4060;
const WS_PORT = process.env.WS_PORT || 4061;

app.get('/health', async () => ({ status: 'ok', service: 'notification-service' }));
app.get('/ready', async () => ({ status: 'ready', kafka: consumer.isConnected(), ws: !!wsService })); // simplified

const start = async () => {
  try {
    // Start Kafka Consumer
    console.log('[Main] Starting Kafka consumer...');
    await startResumeConsumer();
    
    // Start WebSocket Service (initialized in constructor)
    console.log(`[Main] WebSocket server active on port ${WS_PORT}`);

    // Start HTTP Server
    await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`[Main] HTTP Server listening on port ${PORT}`);

    // Graceful Shutdown
    const shutdown = async () => {
      console.log('[Main] Shutting down...');
      await disconnectConsumer();
      wsService.close();
      await app.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
