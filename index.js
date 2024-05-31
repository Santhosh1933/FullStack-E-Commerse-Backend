const express = require("express");
const mongoose = require("mongoose");
const authenticateToken = require("./middlewares/handleToken");
const User = require("./models/user.model");
const ShopOwner = require("./models/shopOwner.model");
const Shop = require("./models/shop.model");
const Category = require("./models/category.model");
const Product = require("./models/product.model");
const handleShopIdToken = require("./middlewares/handleShopIdToken");
const Cart = require("./models/cart.model");
const Order = require("./models/order.model");
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
  const { name, address, owner, contact, shopLogo } = req.body;
  if ((!name || !address || !owner || !contact, shopLogo)) {
    return res
      .status(400)
      .send("Name, address, owner, and contact are required");
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
        country: address.country,
      },
      shopLogo,
      owner,
      contact: {
        email: contact.email,
        phone: contact.phone,
      },
    });
    await shop.save();
    return res.status(201).send("Shop created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating shop");
  }
});

app.get('/shops', async (req, res) => {
  try {
    const shops = await Shop.find();
    return res.status(200).json(shops);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error retrieving shops');
  }
});

app.get('/shop/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const shop = await Shop.findById(id);
    if (!shop) {
      return res.status(404).send('Shop not found');
    }
    return res.status(200).json(shop);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error retrieving shop');
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
      shopId,
    });
    console.log(category);
    await category.save();
    return res.status(201).send("Category created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating category");
  }
});

app.post("/createProduct", async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    specifications,
    thumbnail,
    images,
    shopId,
    quantity,
    productDetails,
    brand,
  } = req.body;
  if (
    !name ||
    !description ||
    !category ||
    !category.id ||
    !category.name ||
    !price ||
    !thumbnail ||
    !shopId ||
    quantity == null ||
    !productDetails ||
    !brand
  ) {
    return res
      .status(400)
      .send(
        "Name, description, category (with id and name), price, thumbnail, shopId, quantity, productDetails, and brand are required"
      );
  }
  try {
    const product = new Product({
      name,
      description,
      category,
      price,
      discountPrice,
      specifications,
      thumbnail,
      images,
      shopId,
      quantity,
      productDetails,
      brand,
    });
    await product.save();
    return res.status(201).send("Product created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error creating product");
  }
});

app.get("/getProduct", handleShopIdToken, async (req, res) => {
  try {
    const shopId = req.shopId;
    let { start, end } = req.query;
    start = parseInt(start);
    end = parseInt(end);
    let products;
    let totalCount;
    if (start !== undefined && end !== undefined && start < end && start >= 0 && end >= 0) {
      products = await Product.find({ shopId })
                              .skip(start)
                              .limit(end - start);
      totalCount = await Product.countDocuments({ shopId });
    } else {
      products = await Product.find({ shopId });
      totalCount = products.length;
    }
    return res.status(200).json({ totalCount, products });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving data");
  }
});

app.get("/getProductById/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving product");
  }
});

app.get("/getCategories", handleShopIdToken, async (req, res) => {
  try {
    const shopId = req.shopId;
    console.log(shopId);
    const categories = await Category.find({ shopId });
    return res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error retrieving categories");
  }
});

app.post("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    const { email, shopId } = req.user;
    const { productId, quantity } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    const correctedQuantity = Math.max(quantity, 1);
    let cart = await Cart.findOne({ userId, shopId });
    if (!cart) {
      cart = new Cart({
        userId,
        shopId,
        items: [{ productId, quantity: correctedQuantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += correctedQuantity;
      } else {
        cart.items.push({ productId, quantity: correctedQuantity });
      }
    }
    await cart.save();
    return res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/remove-from-cart", authenticateToken, async (req, res) => {
  try {
    const { email, shopId } = req.user;
    const { productId } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    const shop = await Shop.findOne({ _id: shopId });
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    let cart = await Cart.findOne({ userId, shopId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingItemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    cart.items.splice(existingItemIndex, 1);
    await cart.save();
    return res
      .status(200)
      .json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get-cart", authenticateToken, async (req, res) => {
  try {
    const { email, shopId } = req.user;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    let cart = await Cart.findOne({ userId, shopId }).populate(
      "items.productId"
    );
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    return res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/create-order", authenticateToken, async (req, res) => {
  try {
    const { email, shopId, cartId } = req.user;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    const cart = await Cart.findOne({ userId, shopId, _id: cartId }).populate(
      "items.productId"
    );
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    const order = new Order({
      userId,
      shopId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      status: "Pending",
    });
    await order.save();
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product) {
        product.quantity = Math.max(product.quantity - item.quantity, 0);
        await product.save();
      }
    }
    await Cart.findByIdAndDelete(cart._id);
    return res
      .status(200)
      .json({ message: "Order created successfully", orderId: order._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/get-orders", authenticateToken, async (req, res) => {
  try {
    const { email, shopId } = req.user;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user._id;
    const orders = await Order.find({ userId, shopId }).populate(
      "items.productId"
    );
    return res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
