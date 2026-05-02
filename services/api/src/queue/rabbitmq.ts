import amqp, { type Channel, type ChannelModel } from 'amqplib';

import { env } from '../config/env.js';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const getOrCreateConnection = async (): Promise<ChannelModel> => {
  if (connection) {
    return connection;
  }

  const nextConnection = await amqp.connect(env.RABBITMQ_URL);

  nextConnection.on('error', () => {
    connection = null;
    channel = null;
  });

  nextConnection.on('close', () => {
    connection = null;
    channel = null;
  });

  connection = nextConnection;
  return nextConnection;
};

export const getOrCreateChannel = async (): Promise<Channel> => {
  if (channel) {
    return channel;
  }

  const conn = await getOrCreateConnection();
  const nextChannel = await conn.createChannel();

  await nextChannel.assertQueue(env.RABBITMQ_QUEUE_NAME, {
    durable: true
  });

  await nextChannel.prefetch(env.RABBITMQ_PREFETCH);

  channel = nextChannel;
  return nextChannel;
};

export const publishJobMessage = async (payload: {
  jobId: string;
  pipelineId: string;
  input: Record<string, unknown>;
}): Promise<boolean> => {
  const ch = await getOrCreateChannel();

  return ch.sendToQueue(
    env.RABBITMQ_QUEUE_NAME,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
      contentType: 'application/json'
    }
  );
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
};
