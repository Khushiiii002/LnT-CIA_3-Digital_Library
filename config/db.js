const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected (Atlas): ${conn.connection.host}`);
    return true;
  } catch (atlasErr) {
    console.warn(`⚠️ Atlas MongoDB Connection Failed: ${atlasErr.message}`);
    console.log("Attempting fallback connection to Local MongoDB (mongodb://127.0.0.1:27017/digital_library)...");
    
    try {
      const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/digital_library", {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`✅ Connected to Local MongoDB: ${localConn.connection.host}`);
      return true;
    } catch (localErr) {
      console.error("\n❌ DATABASE CONNECTION ERROR:");
      console.error("1. If using MongoDB Atlas: Your current IP address is not whitelisted on Atlas.");
      console.error("2. If using Local MongoDB: Ensure the local MongoDB service/daemon is running on port 27017.\n");
      return false;
    }
  }
};

module.exports = connectDB;
