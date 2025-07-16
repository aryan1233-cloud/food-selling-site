import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    slug: { type: String, unique: true }
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

export default mongoose.model("Product", productSchema);
