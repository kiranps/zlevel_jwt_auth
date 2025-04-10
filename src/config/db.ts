import mongoose from 'mongoose';
import { MONGO_URI } from '@config'

const connectDB = async () => {
  try {
    console.log(MONGO_URI)
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
