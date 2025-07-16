import express from "express";
const router = express.Router();

// ✅ Route for /privacy
router.get("/", (req, res) => {
  res.render("privacy");
});

export default router;
