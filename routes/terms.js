import express from "express";
const router = express.Router();
router.get("/", (_, res) => res.render("terms"));
export default router;