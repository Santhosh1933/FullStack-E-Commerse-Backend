const mongoose = require("mongoose");

const shopOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfCreation: {
    type: Date,
    default: Date.now,
  },
});

const ShopOwner = mongoose.model("ShopOwner", shopOwnerSchema);

module.exports = ShopOwner;
