const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

console.log("🔄 Starting E-commerce Catalog System...");

// =============================
// MongoDB Connection
// =============================
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
  });

// =============================
// Product Schema with Nested Variants
// =============================
const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2 },
    price: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Footwear", "Apparel", "Accessories", "Home"],
    },
    variants: [variantSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

// =============================
// Sample Products Data
// =============================
const sampleProducts = [
  {
    _id: "686f63eb90ac2728b3f11082",
    name: "Smartphone",
    price: 699,
    category: "Electronics",
    variants: [],
  },
  {
    _id: "686f68ed2bf5384209b236af",
    name: "Running Shoes",
    price: 120,
    category: "Footwear",
    variants: [
      { color: "Red", size: "M", stock: 10, _id: "686f68ed2bf5384209b236b0" },
      { color: "Blue", size: "L", stock: 5, _id: "686f68ed2bf5384209b236b1" },
    ],
  },
  {
    _id: "686f68ed2bf5384209b236b2",
    name: "Winter Jacket",
    price: 260,
    category: "Apparel",
    variants: [
      { color: "Black", size: "S", stock: 8, _id: "686f68ed2bf5384209b236b3" },
      { color: "Gray", size: "M", stock: 12, _id: "686f68ed2bf5384209b236b4" },
    ],
  },
  {
    _id: "686f68ed2bf5384209b236b5",
    name: "Gaming Laptop",
    price: 1299,
    category: "Electronics",
    variants: [
      { color: "Black", size: "15-inch", stock: 3, _id: "686f68ed2bf5384209b236b6" },
      { color: "Silver", size: "17-inch", stock: 7, _id: "686f68ed2bf5384209b236b7" },
    ],
  },
];

// =============================
// CRUD Routes
// =============================

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.json(sampleProducts);
  }
});

// Get products by category
app.get("/products/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    const filteredProducts = sampleProducts.filter(
      (p) => p.category.toLowerCase() === req.params.category.toLowerCase()
    );
    res.json(filteredProducts);
  }
});

// Get products by color variant
app.get("/products/by-color/:color", async (req, res) => {
  try {
    const color = req.params.color;
    const products = await Product.find({ "variants.color": color });
    res.json(products);
  } catch (err) {
    const filtered = sampleProducts.filter((p) =>
      p.variants.some((v) => v.color.toLowerCase() === req.params.color.toLowerCase())
    );
    res.json(filtered);
  }
});

// Get single product
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

// Create new product
app.post("/products", async (req, res) => {
  try {
    const { name, price, category, variants } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Name is required and must be at least 2 characters" });
    }
    if (!price || price < 1) {
      return res.status(400).json({ error: "Price must be at least 1" });
    }
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const product = new Product({ name, price, category, variants: variants || [] });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add variant to a product
app.post("/products/:id/variants", async (req, res) => {
  try {
    const { color, size, stock } = req.body;
    if (!color || !size || stock === undefined) {
      return res.status(400).json({ error: "Color, size, and stock are required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { variants: { color, size, stock: Number(stock) } } },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update product
app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Root Route
// =============================
app.get("/", async (req, res) => {
  try {
    let products;
    try {
      products = await Product.find();
      if (products.length === 0) products = sampleProducts;
    } catch {
      products = sampleProducts;
    }

    res.json({
      message: "🚀 E-commerce Catalog System is running!",
      status: "Server is active",
      database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
      totalProducts: products.length,
      featuredEndpoints: {
        "GET /products": "Get all products",
        "GET /products/category/Electronics": "Get products by category",
        "GET /products/by-color/Blue": "Get products by color variant",
        "POST /products": "Create new product",
        "POST /products/:id/variants": "Add variant to product",
      },
      examplePayload: {
        createProduct: {
          name: "Product Name",
          price: 100,
          category: "Electronics",
          variants: [{ color: "Black", size: "M", stock: 10 }],
        },
        addVariant: { color: "Red", size: "L", stock: 5 },
      },
    });
  } catch {
    res.json({
      message: "🚀 E-commerce Catalog System is running!",
      status: "Server is active",
      database: "Disconnected ❌",
      totalProducts: sampleProducts.length,
    });
  }
});

// =============================
// Start Server
// =============================
const PORT = process.env.PORT || 3000;
app
  .listen(PORT, () => {
    console.log(`✅ E-COMMERCE CATALOG SYSTEM STARTED on port ${PORT}`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log("📦 Featured endpoints:");
    console.log(`   GET  http://localhost:${PORT}/products`);
    console.log(`   GET  http://localhost:${PORT}/products/category/Electronics`);
    console.log(`   GET  http://localhost:${PORT}/products/by-color/Blue`);
    console.log(`   POST http://localhost:${PORT}/products`);
    console.log(`   POST http://localhost:${PORT}/products/:id/variants`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`🔄 Port ${PORT} is busy, trying 3001...`);
      app.listen(3001, () => {
        console.log(`✅ SERVER STARTED on port 3001`);
        console.log(`🚀 Go to http://localhost:3001`);
      });
    }
  });
