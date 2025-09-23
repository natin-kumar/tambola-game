// sockets/gameSocket.js
const Game = require("../models/game");
const { generateTicket } = require("../controllers/gameController"); // import your ticket generator

module.exports = (io, socket) => {
  console.log("User connected:", socket.id);

  // ------------------ JOIN ROOM ------------------
  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    let game = await Game.findOne({ roomId });
    if (!game) return;

    // If no host yet, set the first user as host
    if (!game.host) {
      game.host = userId;
    }

    // Add player and ticket if not already in game
    if (!game.players.includes(userId)) {
      game.players.push(userId);
      game.tickets.push({
        userId,
        numbers: generateTicket(),
        claimedPatterns: [],
      });
    }

    await game.save();

    // Broadcast updated game state to all players
    io.to(roomId).emit("gameState", game);
  });

  // ------------------ START GAME ------------------
  socket.on("startGame", async ({ roomId }) => {
    const game = await Game.findOne({ roomId });
    if (!game) return;

    game.status = "started";
    await game.save();

    io.to(roomId).emit("gameState", game);
  });

  // ------------------ RESET GAME ------------------
  socket.on("resetGame", async ({ roomId }) => {
    const game = await Game.findOne({ roomId });
    if (!game) return;

    game.status = "waiting";
    game.numbersCalled = [];
    // Optionally reset tickets claimedPatterns
    game.tickets.forEach(t => (t.claimedPatterns = []));
    await game.save();

    io.to(roomId).emit("gameState", game);
  });

  // ------------------ CALL NUMBER ------------------
  socket.on("callNumber", async ({ roomId, number }) => {
    const game = await Game.findOne({ roomId });
    if (!game) return;

    if (!game.numbersCalled.includes(number)) {
      game.numbersCalled.push(number);
      await game.save();

      io.to(roomId).emit("numberCalled", number);
    }
  });

  // ------------------ CLAIM PRIZE ------------------
socket.on("claimPrize", async ({ roomId, userId, prize, clickedNumbers }) => {
  const game = await Game.findOne({ roomId });
  if (!game || game.status === "finished") return;

  const ticket = game.tickets.find(t => t.userId.toString() === userId.toString());
  if (!ticket) return;

  if (!ticket.claimedPatterns) ticket.claimedPatterns = [];
  if (ticket.claimedPatterns.includes(prize)) {
    socket.emit("prizeError", { prize, msg: "Already claimed!" });
    return;
  }

  const calledSet = new Set(game.numbersCalled);

  // --- Determine required numbers for the prize ---
  let requiredNumbers = [];
  const tNumbers = ticket.numbers;

  switch (prize) {
    case "Early Five":
      requiredNumbers = tNumbers.flat().filter(n => calledSet.has(n)).slice(0, 5);
      break;
    case "Top Row":
      requiredNumbers = tNumbers[0].filter(n => calledSet.has(n));
      break;
    case "Middle Row":
      requiredNumbers = tNumbers[1].filter(n => calledSet.has(n));
      break;
    case "Bottom Row":
      requiredNumbers = tNumbers[2].filter(n => calledSet.has(n));
      break;
    case "All Corners":
      requiredNumbers = [
        tNumbers[0][0], tNumbers[0][8],
        tNumbers[2][0], tNumbers[2][8]
      ].filter(Boolean);
      break;
    case "Full House":
      requiredNumbers = tNumbers.flat().filter(Boolean);
      break;
  }

  // --- Validate: all required numbers must be clicked ---
  const allClicked = requiredNumbers.every(n => clickedNumbers.includes(n));
  if (!allClicked) {
    socket.emit("prizeError", { prize, msg: "You must mark all numbers manually!" });
    return;
  }

  // Mark prize as claimed
  ticket.claimedPatterns.push(prize);
  await game.save();

  io.to(roomId).emit("prizeClaimed", { userId, prize });

  // Check winner
  if (ticket.claimedPatterns.length === 6) {
    game.status = "finished";
    await game.save();
    io.to(roomId).emit("winnerDeclared", { userId });
  }
});


  // ------------------ DISCONNECT ------------------
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};
