const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/user.model");
const Product = require("./models/product.model");
const Order = require("./models/order.model");

dotenv.config();

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env file.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Check if data already exists
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    if (userCount === 0 && productCount === 0 && orderCount === 0) {
      console.log("Database is empty. Injecting seed data...");

      // Seed Users
      await User.insertMany([
        {
          _id: 1,
          name: "Alice Smith",
          age: 28,
          city: "New York",
          isPremium: true,
        },
        {
          _id: 2,
          name: "Bob Johnson",
          age: 34,
          city: "Los Angeles",
          isPremium: false,
        },
        {
          _id: 3,
          name: "Charlie Brown",
          age: 22,
          city: "Chicago",
          isPremium: true,
        },
      ]);
      console.log("-> Users seeded successfully.");

      // Seed Products
      await Product.insertMany([
        { _id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        { _id: 2, name: "Smartphone", category: "Electronics", price: 800 },
        { _id: 3, name: "Desk Chair", category: "Furniture", price: 150 },
        { _id: 4, name: "Coffee Maker", category: "Appliances", price: 100 },
      ]);
      console.log("-> Products seeded successfully.");

      // Seed Orders
      await Order.insertMany([
        {
          _id: 1,
          userId: 1,
          status: "completed",
          items: [
            { productId: 1, quantity: 1 },
            { productId: 3, quantity: 2 },
          ], // total: 1200 + 300 = 1500
        },
        {
          _id: 2,
          userId: 2,
          status: "completed",
          items: [
            { productId: 2, quantity: 1 },
            { productId: 4, quantity: 1 },
          ], // total: 800 + 100 = 900
        },
        {
          _id: 3,
          userId: 1,
          status: "cancelled",
          items: [{ productId: 1, quantity: 1 }],
        },
        {
          _id: 4,
          userId: 3,
          status: "completed",
          items: [{ productId: 3, quantity: 4 }], // total: 600
        },
      ]);
      console.log("-> Orders seeded successfully.");

      console.log("✅ Database seeding completed!");
    } else {
      console.log(
        "⚠️ Database already contains data! Skipping seeding to prevent duplicates.",
      );
    }
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
  } finally {
    // Ensuring the connection closes so the node process successfully terminates
    mongoose.connection.close();
  }
};

seedDatabase();
