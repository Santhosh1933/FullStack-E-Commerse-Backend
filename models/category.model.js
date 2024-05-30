const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Shop', 
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
