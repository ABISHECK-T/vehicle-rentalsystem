@"
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/vehicle-rental")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

const User = mongoose.model("User", {
  email: String,
  password: String,
  role: String
});

const Vehicle = mongoose.model("Vehicle", {
  name: String,
  description: String,
  location: String,
  phone: String,
  price: Number,
  status: { type: String, default: "approved" }
});

const Booking = mongoose.model("Booking", {
  vehicleName: String,
  userEmail: String,
  status: { type: String, default: "pending" }
});

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.json({ message: "Registration successful", success: true });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found", success: false });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid password", success: false });
    res.json({ message: "Login successful", success: true, role: user.role, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.json({ message: "Vehicle added", success: true, vehicle });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
});

app.get("/api/vehicles", async (req, res) => {
  const vehicles = await Vehicle.find({ status: "approved" });
  res.json({ vehicles, success: true });
});

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking submitted", success: true });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log("✅ MongoDB Connected");
  console.log("📝 API available at http://localhost:5000/api\n");
});
"@ | Out-File -FilePath server.js -Encoding UTF8