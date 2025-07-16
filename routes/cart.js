import express from "express";
import { ensureLoggedIn } from "../middleware/auth.js"; // ✅ correct

import Product from "../models/Product.js";

const router = express.Router();
const getCart = (req) => (req.session.cart ??= []);
const getCartCount = (cart) => cart.reduce((count, item) => count + item.qty, 0);

// ------------------ ADD ------------------
router.post("/add", ensureLoggedIn, async (req, res) => {
  const { id } = req.body;
  const product = await Product.findById(id).lean();
  if (!product) return res.status(404).json({ ok: false });

  const cart = getCart(req);
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += 1;
  else cart.push({
    id,
    name: product.name,
    price: product.price,
    image: product.image,
    qty: 1
  });

  res.json({ ok: true, cart, cartCount: getCartCount(cart) });
});

// ----------------- UPDATE ----------------
router.post("/update", ensureLoggedIn, (req, res) => {
  const { id, qty } = req.body;
  const cart = getCart(req);
  const item = cart.find((i) => i.id === id);
  if (item) item.qty = Number(qty);

  if (req.headers.accept?.includes("text/html")) return res.redirect("/cart");
  res.json({ ok: true, cart, cartCount: getCartCount(cart) });
});

// ----------------- REMOVE ----------------
router.post("/remove", ensureLoggedIn, (req, res) => {
  req.session.cart = getCart(req).filter((i) => i.id !== req.body.id);

  if (req.headers.accept?.includes("text/html")) return res.redirect("/cart");
  res.json({ ok: true, cart: req.session.cart, cartCount: getCartCount(req.session.cart) });
});

// ---------------- PAGE -------------------
router.get("/", ensureLoggedIn, (req, res) => {
  const cart = getCart(req);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  res.render("cart", { cart, total });
});

export default router;
