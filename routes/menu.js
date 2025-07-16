// routes/menu.js
import express from "express";
import Product from "../models/Product.js"; // ✅ Correct model

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await Product.find();
    const cart = req.session.cart || [];

    res.render("menu", { items, cart });
  } catch (err) {
    console.error("Error loading menu:", err);
    res.status(500).send("Failed to load menu");
  }
});

export default router;
