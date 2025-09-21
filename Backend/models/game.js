const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  numbers: [[Number]], // 3x9 ticket matrix
});

const gameSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tickets: [ticketSchema],
  numbersCalled: [Number],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);
