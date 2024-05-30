const express = require("express");
const mongoose = require("mongoose");
const authenticateToken = require("./middlewares/handleToken");
const User = require("./models/user.model");
const ShopOwner = require("./models/shopOwner.model");
const Shop = require("./models/shop.model");
require("dotenv").config();
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

app.listen(8000, () => {
  console.log(`http:localhost:8000`);
});

app.get("/", (req, res) => {
  return res.send("Initial Route").status(200);
});

app.post("/createUser", authenticateToken, async (req, res) => {
  const { email, profileUrl, name } = req.user;
  if (!email || !profileUrl || !name) {
    return res.status(400).send("Invalid token payload");
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(200)
        .send("User already exists. Logged in successfully.");
    }
    user = new User({ email, profileUrl, name });
    await user.save();
    return res.status(201).send("User created successfully");
  } catch (error) {
    return res.status(500).send("Error creating user");
  }
});

app.post("/createShopOwner", async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).send("Name, email, and phone are required");
  }
  try {
    let existingOwner = await ShopOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).send("Shop owner with this email already exists");
    }
    const shopOwner = new ShopOwner({ name, email, phone });
    await shopOwner.save();
    return res.status(201).send("Shop owner created successfully");
  } catch (error) {
    return res.status(500).send("Error creating shop owner");
  }
});

app.post("/createShop", async (req, res) => {
  const { name, address, owner, contact } = req.body;
  if (!name || !address || !owner || !contact) {
    return res.status(400).send("Name, address, owner, and contact are required");
  }
  try {
    const existingShop = await Shop.findOne({ owner });
    if (existingShop) {
      return res.status(400).send("This owner already has a shop");
    }
    const shop = new Shop({
      name,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      },
      owner,
      contact: {
        email: contact.email,
        phone: contact.phone
      }
    });
    await shop.save();
    return res.status(201).send("Shop created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating shop");
  }
});

app.post("/createCategory", async (req, res) => {
  const { name, thumbnail, shopId } = req.body;
  if (!name || !thumbnail || !shopId) {
    return res.status(400).send("Name, thumbnail, and shopId are required");
  }
  try {
    const category = new Category({
      name,
      thumbnail,
      shopId
    });
    console.log(category);
    await category.save();
    return res.status(201).send("Category created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating category");
  }
});
