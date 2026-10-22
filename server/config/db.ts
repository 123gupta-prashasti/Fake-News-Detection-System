import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Database] MONGODB_URI not set. Running with built-in persistent JSON repository.');
    return false;
  }

  if (isConnected) return true;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection failed: ${err.message}. Seamlessly falling back to local persistent repository.`);
    isConnected = false;
    return false;
  }
}

export function isMongoDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
