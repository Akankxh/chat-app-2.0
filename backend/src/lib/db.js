import mongoose from 'mongoose';
import dotenv from 'dotenv';

export const connectDB = async () => {
  try {
    dotenv.config();
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully:', conn.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};