import { app } from './app.js';
import { env } from './config/env.js';
import { connectToDatabase } from './db/connect.js';

const start = async (): Promise<void> => {
  await connectToDatabase(env.MONGODB_URI);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${env.PORT}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
