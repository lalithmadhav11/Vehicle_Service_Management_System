import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Attempt standard connection with extra stability bounds for strict ISPs/Node 18+ TLS
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // Wait up to 15s before failing
      socketTimeoutMS: 45000,          // Close idle sockets after 45s
      family: 4,                       // Keep IPv4 (fixes IPv6 Atlas SRV DNS bugs)
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Catch subsequent disconnects without killing the server
    mongoose.connection.on('error', err => {
      console.warn(`[MongoDB Catch] Non-fatal network drop: ${err.message}`);
    });

  } catch (error) {
    console.error("❌ MongoDB TLS/Network error:", error.message);
    console.log("⏳ Node.js OpenSSL dropped the connection. Retrying in 5s...");
    setTimeout(connectDB, 5000); // Prevent process crash + loop retry seamlessly
  }
};

export default connectDB;