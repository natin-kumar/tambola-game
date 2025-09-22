const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  numbers: { type: [[Number]], required: true }, // 3x9 matrix
  claimedPatterns: { type: [String], default: [] }, // track claimed prizes
});


const gameSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true }, 
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tickets: [ticketSchema],
  numbersCalled: { type: [Number], default: [] },
  status: { type: String, enum: ["waiting", "started", "finished"], default: "waiting" },
}, { timestamps: true });


module.exports = mongoose.model("Game", gameSchema);
