import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    // In production a missing DB connection should be loud, not silently swallowed.
    if (env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('Continuing without a database connection (development mode only).');
  }
}
