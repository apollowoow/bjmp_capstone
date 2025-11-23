const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ==========================
// ROUTE IMPORTS
// ==========================
const pdlRoutes = require("./routes/pdlRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// 👇 1. ADD THIS IMPORT HERE
const authRoutes = require("./routes/authRoutes"); 


// ==========================
// USE ROUTES
// ==========================
app.use("/api/pdl", pdlRoutes);
app.use("/api/users", userRoutes);

// 👇 2. USE THE ROUTE HERE (This enables http://localhost:5000/api/auth/login)
app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);
// ==========================
// ROOT & SERVER
// ==========================
app.get("/", (req, res) => {
  res.send("BJMP API RUNNING");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));