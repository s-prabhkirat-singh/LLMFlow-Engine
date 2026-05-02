import { ConsumeMessage } from 'amqplib';

import { env } from './config/env.js';
import { connectToDatabase } from './db/connect.js';
import { getOrCreateChannel } from './queue/rabbitmq.js';
import { processPipelineJob } from './workers/pipeline-job.worker.js';

type QueueJobMessage = {
  jobId: string;
  pipelineId: string;
  input: Record<string, unknown>;
};

const parseMessage = (message: ConsumeMessage): QueueJobMessage => {
  return JSON.parse(message.content.toString()) as QueueJobMessage;
};

const startWorker = async (): Promise<void> => {
  await connectToDatabase(env.MONGODB_URI);
  const channel = await getOrCreateChannel();

  await channel.consume(env.RABBITMQ_QUEUE_NAME, async (message) => {
    if (!message) {
      return;
    }

    try {
      const payload = parseMessage(message);
      const processed = await processPipelineJob(payload);

      if (processed.shouldRetry) {
        channel.nack(message, false, true);
      } else {
        channel.ack(message);
      }
    } catch (error) {
      channel.nack(message, false, false);
      // eslint-disable-next-line no-console
      console.error('Worker failed to process job', error);
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Worker listening on queue ${env.RABBITMQ_QUEUE_NAME}`);
};

startWorker().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start worker', error);
  process.exit(1);
});
