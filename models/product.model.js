const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  specifications: { type: Object },
  dateOfCreation: { type: Date, default: Date.now },
  thumbnail: { type: String, required: true },
  images: [String],
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
