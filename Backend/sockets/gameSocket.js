// sockets/gameSocket.js
const Game = require("../models/game");

module.exports = (io, socket) => {
  console.log("User connected:", socket.id);

  // Player joins room
  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    const game = await Game.findOne({ roomId });

    // if no host yet, set the first user as host
    if (!game.host) {
      game.host = userId;
      await game.save();
    }

    socket.emit("gameState", game);
  });

  // Host starts game
  socket.on("startGame", async ({ roomId }) => {
    const game = await Game.findOne({ roomId });
    if (!game) return;

    game.status = "started";
    await game.save();

    io.to(roomId).emit("gameState", game);
  });

  // Host resets game
  socket.on("resetGame", async ({ roomId }) => {
    const game = await Game.findOne({ roomId });
    if (!game) return;

    game.status = "waiting";
    game.numbersCalled = [];
    await game.save();

    io.to(roomId).emit("gameState", game);
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
