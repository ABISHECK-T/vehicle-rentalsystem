const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ===== DB =====
mongoose.connect("mongodb://127.0.0.1:27017/vehicle-rental")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// ===== MODELS =====
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "user" }
}));

const Vehicle = mongoose.model("Vehicle", new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  phone: String,
  address: String,
  price: Number,
  status: { type: String, default: "approved" }
}));

const Booking = mongoose.model("Booking", new mongoose.Schema({
  vehicleName: String,
  userEmail: String,
  status: { type: String, default: "pending" }, // 🔥 important
  createdAt: { type: Date, default: Date.now }
}));

// ===== AUTH =====
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  res.json({ message: "Registered" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Wrong password" });

  res.json({ email, role: user.role });
});

// ===== VEHICLES =====
app.post("/api/vehicles", async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  res.json({ vehicle });
});

app.get("/api/vehicles", async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json({ vehicles });
});

// ===== BOOKINGS =====

// USER → BOOK
app.post("/api/bookings", async (req, res) => {
  const { vehicleName, userEmail } = req.body;

  const booking = await Booking.create({
    vehicleName,
    userEmail,
    status: "pending"
  });

  res.json({ booking });
});

// ADMIN → VIEW BOOKINGS
app.get("/api/admin/bookings", async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });

  res.json({
    bookings   // 🔥 MUST be this name
  });
});

// ADMIN → APPROVE / REJECT
app.put("/api/admin/bookings/:id", async (req, res) => {
  const { status } = req.body; // approved / rejected

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ booking });
});

// ===== START =====
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});