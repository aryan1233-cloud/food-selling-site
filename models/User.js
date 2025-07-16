import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    /**
     * NEW ➜ allow mobile login
     * – optional during signup but must be unique if present
     */
    mobile: { type: String, unique: true, sparse: true },

    password: { type: String, required: true },
    resetToken: String,
    resetTokenExp: Date,

    isAdmin: { type: Boolean, default: false },

    // 🔐 OTP login fields
    otpCode: String,
    otpCodeExp: Date
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate reset token
userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetTokenExp = Date.now() + 15 * 60 * 1000; // 15 min
  return token;
};

export default mongoose.model("User", userSchema);
