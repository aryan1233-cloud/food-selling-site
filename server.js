import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import "dotenv/config";


dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

app.use((req, res, next) => {
  const cart = req.session.cart || [];

  res.locals.user = req.session.user || null;
  res.locals.cart = cart;

  // ✅ Define cartCount globally for EJS
  res.locals.cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;

  delete req.session.success;
  delete req.session.error;
  next();
});


import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import accountRoutes from "./routes/account.js";
import contactRoutes from "./routes/contact.js";
import privacyRoutes from "./routes/privacy.js";
import menuRoutes from "./routes/menu.js";
import adminRoutes from "./routes/admin.js";
import faqRoutes from "./routes/faq.js";
import termsRoutes from "./routes/terms.js";

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/account", accountRoutes);
app.use("/contact", contactRoutes);
app.use("/privacy", privacyRoutes);
app.use("/admin", adminRoutes);   // now /admin/add-menu works
app.use('/menu', menuRoutes);
app.use("/faq", faqRoutes);
app.use("/terms", termsRoutes);

app.use((req, res) => res.status(404).render("404"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
