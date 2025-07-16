import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Product.deleteMany();
await Product.insertMany([
  { name: "Margherita Pizza", price: 249, image: "pizza.jpg" },
  { name: "Veg Burger", price: 149, image: "burger.jpg" },
  { name: "Pasta Alfredo", price: 199, image: "pasta.jpg" }
]);

console.log("Products seeded");
await mongoose.disconnect();
