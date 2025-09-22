// sockets/gameSocket.js
const Game = require("../models/game");

module.exports = (io, socket) => {
  console.log("User connected:", socket.id);

  // Player joins room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Optionally send current game state
    const game = await Game.findOne({ roomId });
    socket.emit("gameState", game);
  });

  // Host calls a number
  socket.on("callNumber", async ({ roomId, number }) => {
    const game = await Game.findOne({ roomId });
    if (!game) return;

    game.numbersCalled.push(number);
    await game.save();

    io.to(roomId).emit("numberCalled", number);
  });

  // Player claims a prize
  socket.on("claimPrize", async ({ roomId, userId, prize }) => {
    const game = await Game.findOne({ roomId });
    const ticket = game.tickets.find(t => t.userId.toString() === userId);
    if (!ticket.claimedPatterns) ticket.claimedPatterns = [];
    ticket.claimedPatterns.push(prize);
    await game.save();

    io.to(roomId).emit("prizeClaimed", { userId, prize });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
