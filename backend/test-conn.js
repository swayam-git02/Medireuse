import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error('No MongoDB URI found in environment. Set MONGODB_URI in .env');
  process.exit(1);
}

(async () => {
  try {
    console.log('Attempting MongoDB connection...');
    const conn = await mongoose.connect(uri, {
      // rely on mongoose defaults (v6+)
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error(err);
    process.exit(2);
  }
})();
