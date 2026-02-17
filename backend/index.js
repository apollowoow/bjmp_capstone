const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const os = require('os');

dotenv.config();
const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Serving static files for PDL Photos
app.use("/public/uploads", express.static(path.join(__dirname, "public/uploads")));

// ==========================
// ROUTE IMPORTS
// ==========================
const authRoutes = require("./routes/authRoutes"); 
const pdlRoutes = require("./routes/pdlRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const sessionRoutes = require('./routes/sessionRoutes'); 
const reportRoutes = require("./routes/reportRoutes");
const incidentRoutes = require("./routes/incidentRoutes"); // 🎯 1. IMPORT INCIDENT ROUTES

// ==========================
// USE ROUTES
// ==========================
app.use("/api/auth", authRoutes);       
app.use("/api/pdl", pdlRoutes);         
app.use("/api/users", userRoutes);       
app.use("/api/dashboard", dashboardRoutes); 
app.use("/api/sessions", sessionRoutes);   
app.use("/api/reports", reportRoutes);     
app.use("/api/incidents", incidentRoutes); // 🎯 2. REGISTER INCIDENT ROUTE

// ==========================
// ROOT & SERVER
// ==========================
app.get("/", (req, res) => {
  res.send("BJMP API RUNNING");
});

app.use('/public', express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    const networkInterfaces = os.networkInterfaces();
    let laptopIp = 'localhost';
    for (const name in networkInterfaces) {
        for (const iface of networkInterfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                laptopIp = iface.address;
            }
        }
    }
    console.log(`
    🚀 Backend Live: http://${laptopIp}:${PORT}
    📡 API Base URL: http://${laptopIp}:${PORT}/api
    `);
});