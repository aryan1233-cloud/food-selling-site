import express from "express";
const router = express.Router();

// Home page
router.get("/", (_, res) => res.render("index"));

// ✅ Return Policy Page — Add this
router.get("/return-policy", (_, res) => {
  res.render("return-policy");
});

export default router;
