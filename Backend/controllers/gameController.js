const Game = require("../models/game");

// Helper: generate random tambola ticket
function generateTicket() {
  let ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
  let nums = Array.from({ length: 90 }, (_, i) => i + 1);

  for (let row = 0; row < 3; row++) {
    let chosen = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * nums.length);
      chosen.push(nums[idx]);
      nums.splice(idx, 1);
    }
    chosen.sort((a, b) => a - b);

    let colIndices = [];
    while (colIndices.length < 5) {
      const col = Math.floor(Math.random() * 9);
      if (!colIndices.includes(col)) colIndices.push(col);
    }
    colIndices.sort((a, b) => a - b);
    colIndices.forEach((col, i) => (ticket[row][col] = chosen[i]));
  }

  return ticket;
}

// Helper: generate 4-digit room ID
function generateRoomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Ensure unique room ID
async function createUniqueRoomId() {
  let id;
  let exists = true;
  while (exists) {
    id = generateRoomId();
    exists = await Game.findOne({ roomId: id });
  }
  return id;
}

// --- CREATE GAME ---
// --- CREATE GAME ---
exports.createGame = async (req, res) => {
  try {
    const roomId = await createUniqueRoomId();

    const hostTicket = { 
      userId: req.user.id, 
      numbers: generateTicket() 
    };

    const game = new Game({
      host: req.user.id,
      players: [req.user.id],
      tickets: [hostTicket], // <-- host ticket included
      roomId,
    });
    console.log("game:",game)
    await game.save();
    res.json({ msg: "Game created", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// --- JOIN GAME ---
exports.joinGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(roomId,"room")
    const game = await Game.findOne({ roomId });
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (!game.players.includes(req.user.id)) {
      game.players.push(req.user.id);
      const ticket = { userId: req.user.id, numbers: generateTicket() };
      game.tickets.push(ticket);
      await game.save();
    }
    console.log(game,"game");
    res.json({ msg: "Joined game", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- GET GAME STATE ---
exports.getGameState = async (req, res) => {
  try {
    const { roomId } = req.params;
    const game = await Game.findOne({ roomId }).populate("players", "username email");
    if (!game) return res.status(404).json({ error: "Game not found" });

    res.json({
      gameId: game._id,
      roomId: game.roomId,
      status: game.status,
      numbersCalled: game.numbersCalled,
      tickets: game.tickets.map(t => ({
        userId: t.userId,
        numbers: t.numbers,
        claimedPatterns: t.claimedPatterns,
      })),
      createdBy: game.host,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// --- CLAIM WIN ---
exports.claimWin = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { pattern } = req.body;
    const userId = req.user.id;

    const game = await Game.findOne({ roomId });
    if (!game) return res.status(404).json({ error: "Game not found" });

    const ticket = game.tickets.find(t => t.userId.toString() === userId.toString());
    if (!ticket) return res.status(400).json({ error: "Ticket not found" });

    if (ticket.claimedPatterns.includes(pattern)) {
      return res.status(400).json({ error: "Pattern already claimed" });
    }

    // TODO: validate pattern properly
    ticket.claimedPatterns.push(pattern);
    await game.save();

    res.json({ msg: `Pattern '${pattern}' claimed successfully!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
