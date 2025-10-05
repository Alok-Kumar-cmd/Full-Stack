const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

console.log("🔄 Starting server...");

// =============================
// MongoDB Connection
// =============================
const MONGODB_URI = "mongodb://localhost:27017/products";

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log("✅ MongoDB connected successfully");
})
.catch((err) => {
  console.log("❌ MongoDB connection failed:", err.message);
  console.log("💡 Using in-memory storage instead");
});

// =============================
// Product Schema
// =============================
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    minlength: 3 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  category: { 
    type: String, 
    enum: ["Electronics", "Clothing", "Food", "Other", "Accessories", "Stationery"], 
    default: "Other" 
  }
});

const Product = mongoose.model("Product", productSchema);

// =============================
// SAMPLE PRODUCTS DATA
// =============================
const sampleProducts = [
  { 
    _id: "686f5c106b7e1b4605d09e60", 
    name: "Laptop", 
    price: 1200, 
    category: "Electronics" 
  },
  { 
    _id: "686f5c106b7e1b4605d09e61", 
    name: "Wireless Mouse", 
    price: 25, 
    category: "Accessories" 
  },
  { 
    _id: "686f5c106b7e1b4605d09e62", 
    name: "Notebook", 
    price: 5, 
    category: "Stationery" 
  },
  { 
    _id: "686f5c106b7e1b4605d09e63", 
    name: "Smartphone", 
    price: 699, 
    category: "Electronics" 
  }
];

// =============================
// ROOT ROUTE - SHOWS EVERYTHING
// =============================
app.get("/", async (req, res) => {
  try {
    let products;
    
    // Try to get products from MongoDB, fallback to sample data
    try {
      products = await Product.find();
      if (products.length === 0) {
        products = sampleProducts;
      }
    } catch (err) {
      products = sampleProducts;
    }
    
    res.json({
      message: "🚀 Product CRUD API is running!",
      status: "Server is active",
      database: mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
      totalProducts: products.length,
      products: products,
      endpoints: {
        "GET /": "API info with products (this page)",
        "POST /products": "Create product",
        "GET /products": "Get all products only",
        "GET /products/:id": "Get single product",
        "PUT /products/:id": "Update product",
        "DELETE /products/:id": "Delete product"
      }
    });
  } catch (err) {
    res.json({
      message: "🚀 Product CRUD API is running!",
      status: "Server is active",
      database: "Disconnected ❌",
      totalProducts: sampleProducts.length,
      products: sampleProducts,
      endpoints: {
        "GET /": "API info with products (this page)",
        "POST /products": "Create product",
        "GET /products": "Get all products only",
        "GET /products/:id": "Get single product",
        "PUT /products/:id": "Update product",
        "DELETE /products/:id": "Delete product"
      }
    });
  }
});

// =============================
// OTHER CRUD ROUTES (keep existing functionality)
// =============================

// CREATE PRODUCT
app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET ALL PRODUCTS ONLY
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.json(sampleProducts);
  }
});

// GET SINGLE PRODUCT
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

// UPDATE PRODUCT
app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE PRODUCT
app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({
      message: "Product deleted",
      product: product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Start Server
// =============================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ SERVER STARTED SUCCESSFULLY on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Go to http://localhost:${PORT} to see products on the main page!`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`🔄 Port ${PORT} is busy, trying 3001...`);
    app.listen(3001, () => {
      console.log(`✅ SERVER STARTED on port 3001`);
      console.log(`🚀 Go to http://localhost:3001 to see products!`);
    });
  } else {
    console.error("❌ Server startup failed:", err);
  }
});
