import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`\n✅ MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
};

export default connectDB;
