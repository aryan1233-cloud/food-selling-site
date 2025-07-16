import express from "express";
const router = express.Router();
router.get("/", (_, res) => res.render("faq"));
export default router;