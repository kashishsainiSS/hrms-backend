import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToDatabase = async () => {
  try {
    const uri: string = process.env.MONGODB_URI!;
    const options: any = {
      useUnifiedTopology: true,
    };
    await mongoose.connect(uri, options);
    console.log('Connected to MongoDB Atlas');


    return mongoose.connection;
  } catch (error : any) {
    console.error('Error connecting to MongoDB Atlas:', error?.message);
  }
};

connectToDatabase();
