import mongoose from 'mongoose';

export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
};
