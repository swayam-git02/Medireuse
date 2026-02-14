import mongoose from 'mongoose';

const DEFAULT_RETRIES = 5;

const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('No MongoDB URI provided. Set MONGODB_URI or MONGO_URI in env.');
    throw new Error('Missing MongoDB URI');
  }

  let attempts = 0;
  const connectWithRetry = async () => {
    try {
      attempts += 1;
      const conn = await mongoose.connect(mongoUri, {
        // recommended options are set by mongoose defaults for v6+
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });
      return conn;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempts} failed: ${error.message}`);
      if (attempts < (parseInt(process.env.DB_CONNECT_RETRIES || DEFAULT_RETRIES, 10))) {
        const backoff = Math.min(1000 * 2 ** attempts, 30000);
        console.log(`Retrying connection in ${backoff} ms...`);
        await new Promise((r) => setTimeout(r, backoff));
        return connectWithRetry();
      } else {
        console.error('Exceeded MongoDB connection retries');
        throw error;
      }
    }
  };

  return connectWithRetry();
};

export default connectDB;
