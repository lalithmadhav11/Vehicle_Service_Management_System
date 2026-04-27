import mongoose from "mongoose";

const URI = "mongodb://sandeepjat_db_user:M6qkB3tJZOujCBOb@ac-qzb8923-shard-00-00.vdvpwny.mongodb.net:27017,ac-qzb8923-shard-00-01.vdvpwny.mongodb.net:27017,ac-qzb8923-shard-00-02.vdvpwny.mongodb.net:27017/vehicle_service_db?ssl=true&replicaSet=atlas-qzb8923-shard-0&authSource=admin&retryWrites=true&w=majority";

async function test() {
  try {
    await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Success! Connected to:", mongoose.connection.host);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

test();
