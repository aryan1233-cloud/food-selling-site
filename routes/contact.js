// routes/contact.js
import express from "express";
const router = express.Router();
import ContactMessage from "../models/ContactMessage.js";

router.get("/", (req, res) => {
  res.render("contact");
});

// Handle form submission
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await ContactMessage.create({ name, email, message });
    req.session.success = "Message sent successfully!";
    res.redirect("/contact");
  } catch (err) {
    console.error("Error saving contact form:", err);
    req.session.error = "Something went wrong. Please try again.";
    res.redirect("/contact");
  }
});


export default router;
