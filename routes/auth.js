import express from "express";
import crypto from "crypto";
import User from "../models/User.js";
import { sendResetEmail } from "../config/mailer.js";
import fetch from "node-fetch";
import { ensureLoggedIn, ensureAdmin } from "../middleware/auth.js";


const router = express.Router();

/* ------------------------------ REGISTER ------------------------------ */
router
  .route("/register")
  .get((_, res) => res.render("register"))
  .post(async (req, res) => {
    const { name, email, mobile, password } = req.body;
    try {
      if (await User.findOne({ $or: [{ email }, { mobile }] })) {
        throw new Error("Email or mobile already exists");
      }

      const user = await User.create({ name, email, mobile, password });

      // auto‑login after registration
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      };

      req.session.success = "Welcome, you're logged in!";
      res.redirect("/menu");
    } catch (err) {
      req.session.error = err.message;
      res.redirect("/auth/register");
    }
  });

/* ------------------------------ EMAIL LOGIN --------------------------- */
router
  .route("/login")
  .get((_, res) => res.render("login")) // renders email/password form
  .post(async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        throw new Error("Invalid email or password");
      }

      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      };

      res.redirect("/menu");
    } catch (err) {
      req.session.error = err.message;
      res.redirect("/auth/login");
    }
  });

/* ------------------------------ OTP LOGIN ----------------------------- */
router.get("/otp-login", (_, res) => {
  res.render("otp-login"); // mobile input form
});


router.post("/send-otp", async (req, res) => {
  let { mobile } = req.body;
  mobile = mobile.replace(/\D/g, "");

  try {
    const user = await User.findOne({ mobile });
    if (!user) throw new Error("Mobile number not registered");

    const apiKey = process.env.TWOFACTOR_API_KEY;
    const response = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/AUTOGEN`);
    const data = await response.json();

    if (data.Status !== "Success") {
      throw new Error("OTP send failed: " + data.Details);
    }

    // Save session ID from 2Factor for verification
    req.session.tempUserId = user._id;
    req.session.otpSessionId = data.Details;

    res.redirect("/auth/verify-otp");
  } catch (err) {
    req.session.error = err.message;
    res.redirect("/auth/otp-login");
  }
});

// ─────────── RENDER VERIFY‑OTP PAGE ───────────
router.get("/verify-otp", (req, res) => {
  // basic guard: if the user hasn’t requested an OTP, send them back
  if (!req.session.tempUserId || !req.session.otpSessionId) {
    req.session.error = "Please request an OTP first";
    return res.redirect("/auth/otp-login");
  }
  res.render("verify-otp");               // <‑‑ your EJS view
});


router.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  try {
    const sessionId = req.session.otpSessionId;
    const user = await User.findById(req.session.tempUserId);
    if (!user || !sessionId) throw new Error("Session expired. Please request OTP again.");

    const apiKey = process.env.TWOFACTOR_API_KEY;
    const verifyRes = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`);
    const verifyData = await verifyRes.json();

    if (verifyData.Status !== "Success") {
      throw new Error("Invalid or expired OTP");
    }

    // OTP is valid → log the user in
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isAdmin: user.isAdmin,
    };

    req.session.tempUserId = undefined;
    req.session.otpSessionId = undefined;

    res.redirect("/menu");
  } catch (err) {
    req.session.error = err.message;
    res.redirect("/auth/verify-otp");
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const userId = req.session.tempUserId;
    if (!userId) throw new Error("Session expired. Please request OTP again.");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const apiKey = process.env.TWOFACTOR_API_KEY;
    const mobile = user.mobile;

    const response = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/AUTOGEN`);
    const data = await response.json();

    if (data.Status !== "Success") {
      throw new Error("Resend OTP failed: " + data.Details);
    }

    req.session.otpSessionId = data.Details;
    req.session.success = "OTP resent successfully";
    res.redirect("/auth/verify-otp");
  } catch (err) {
    req.session.error = err.message;
    res.redirect("/auth/otp-login");
  }
});


/* ------------------------------ LOGOUT -------------------------------- */
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* -------------------------- FORGOT PASSWORD --------------------------- */
router
  .route("/forgot")
  .get((_, res) => res.render("forgot"))
  .post(async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error("No account with that email");

      const token = user.createResetToken();
      await user.save({ validateBeforeSave: false });
      await sendResetEmail(user.email, token);

      req.session.success = "Reset link sent to email";
      res.redirect("/auth/login");
    } catch (err) {
      req.session.error = err.message;
      res.redirect("/auth/forgot");
    }
  });

/* --------------------------- RESET PASSWORD --------------------------- */
router
  .route("/reset/:token")
  .get(async (req, res) => {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashed,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) return res.redirect("/auth/forgot");

    res.render("reset", { token: req.params.token });
  })
  .post(async (req, res) => {
    const hashed = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashed,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      req.session.error = "Token expired, try again";
      return res.redirect("/auth/forgot");
    }

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    req.session.success = "Password updated! Please login.";
    res.redirect("/auth/login");
  });

export default router;