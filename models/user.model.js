const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  profileUrl: { type: String, required: true },
  name: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
