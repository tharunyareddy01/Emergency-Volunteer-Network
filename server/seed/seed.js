const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@evn.com";

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "admin123",
      10
    );

    await User.create({
      name: "EVN Administrator",
      email: adminEmail,
      phone: "9000000001",
      password: hashedPassword,
      role: "admin",
      profileImage: "",
      isBlocked: false
    });

    console.log("=================================");
    console.log("Admin account created successfully");
    console.log("Email: admin@evn.com");
    console.log("Password: admin123");
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("Admin seed error:", error);
    process.exit(1);
  }
};

seedAdmin();