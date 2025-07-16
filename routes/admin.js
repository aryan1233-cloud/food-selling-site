import express from "express";
import { ensureLoggedIn, ensureAdmin } from "../middleware/auth.js";
import Product from "../models/Product.js";

const router = express.Router();

// GET /add-menu – show form (admin only)
router.get("/add-menu", ensureLoggedIn, ensureAdmin, (_, res) => {
  res.render("add-menu", { error: null });
});

// POST /add-menu – handle form submit (admin only)
router.post("/add-menu", ensureLoggedIn, ensureAdmin, async (req, res) => {
  const { name, price, image } = req.body;

  try {
    if (!name || !price || !image) throw new Error("All fields are required");
    await Product.create({ name, price, image });
    res.redirect("/products/menu");
  } catch (err) {
    res.render("add-menu", { error: err.message });
  }
});

export default router;
