// routes/account.js
import express from "express";
import { ensureLoggedIn } from "../middleware/auth.js";

import Order from "../models/Order.js";

const router = express.Router();

// GET /account
router.get("/", ensureLoggedIn, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id }).sort("-createdAt");
    res.render("account", {
      user: req.session.user,
      orders
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.render("account", {
      user: req.session.user,
      orders: [],
      error: "Failed to fetch orders"
    });
  }
});

export default router;

