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
  const tNumbers = ticket.numbers;

  // --- Determine required numbers for the prize ---
  let requiredNumbers = [];

  switch (prize) {
    case "Early Five":
      // All numbers on the ticket that are called AND clicked
      const ticketNumbersFlat = tNumbers.flat().filter(Boolean);
      const clickedAndCalled = ticketNumbersFlat.filter(
        n => calledSet.has(n) && clickedNumbers.includes(n)
      );

      if (clickedAndCalled.length < 5) {
        socket.emit("prizeError", { prize, msg: "You need at least 5 clicked numbers that are called!" });
        return;
      }
      requiredNumbers = clickedAndCalled.slice(0, 5);
      break;

    case "Top Row":
      requiredNumbers = tNumbers[0].filter(n => n !== null);
      break;
    case "Middle Row":
      requiredNumbers = tNumbers[1].filter(n => n !== null);
      break;
    case "Bottom Row":
      requiredNumbers = tNumbers[2].filter(n => n !== null);
      break;
    case "All Corners":
      requiredNumbers = [
        tNumbers[0][0],
        tNumbers[0][8],
        tNumbers[2][0],
        tNumbers[2][8],
      ].filter(Boolean);
      break;
    case "Full House":
      requiredNumbers = tNumbers.flat().filter(Boolean);
      break;

    default:
      socket.emit("prizeError", { prize, msg: "Invalid prize!" });
      return;
  }

  // --- Validation: numbers must be called AND clicked ---
  const allCalled = requiredNumbers.every(n => calledSet.has(n));
  const allClicked = requiredNumbers.every(n => clickedNumbers.includes(n));

  if (!allCalled || !allClicked) {
    socket.emit("prizeError", { prize, msg: "Numbers not called or not marked on your ticket!" });
    return;
  }

  // --- Mark prize as claimed ---
  ticket.claimedPatterns.push(prize);
  await game.save();

  io.to(roomId).emit("prizeClaimed", { userId, prize });

  // --- Check winner ---
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
