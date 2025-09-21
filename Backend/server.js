const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const gameSocket = require("./sockets/gameSocket")

dotenv.config();
connectDB(); // connect MongoDB

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

// Basic health check
app.get("/", (req, res) => {
  res.send("Tambola Backend Running 🎉");
});

// Setup server + socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Attach socket logic
io.on("connection", (socket) => {
  gameSocket(io, socket);
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
