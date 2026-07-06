const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  try {
    // Try to connect to the provided URI first
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Failed to connect to ${MONGODB_URI}. Falling back to in-memory database for testing...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`In-memory MongoDB connected: ${inMemoryUri}`);
    } catch (inMemoryError) {
      console.error('Failed to start in-memory MongoDB:', inMemoryError);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
