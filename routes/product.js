import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/menu", async (_, res) => {
  const items = await Product.find();
  res.render("menu", { items });
});

router.post("/seed", async (_, res) => {
  await Product.deleteMany();
  await Product.insertMany([
    { name: "Margherita Pizza", price: 249, image: "pizza.jpg" },
    { name: "Veg Burger", price: 149, image: "burger.jpg" },
    { name: "Pasta Alfredo", price: 199, image: "pasta.jpg" }
  ]);
  res.send("Seeded");
});

export default router;
