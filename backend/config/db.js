import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let useMockDb = false;

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ No MONGODB_URI found in .env. Falling back to local file-based database store.');
    useMockDb = true;
    return { useMockDb: true };
  }

  try {
    // Set a short connection timeout so it falls back quickly if MongoDB is not running
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    useMockDb = false;
    return { useMockDb: false };
  } catch (err) {
    console.warn(`⚠️ MongoDB Connection Error: ${err.message}`);
    console.warn('💡 Falling back to high-reliability local JSON file-based database system...');
    useMockDb = true;
    return { useMockDb: true };
  }
};

export const getDbMode = () => useMockDb;
export const setDbMode = (mode) => { useMockDb = mode; };
