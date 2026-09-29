const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = "mongodb://127.0.0.1:27017/emergency_volunteer_network";

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected");
    console.log("Database: emergency_volunteer_network");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;