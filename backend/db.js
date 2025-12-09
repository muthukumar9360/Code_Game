import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Check your MONGO_URI in .env file');
    process.exit(1);
  }
};

export default connectDB;
