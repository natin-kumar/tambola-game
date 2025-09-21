const Game = require("../models/game");

// Helper: generate random tambola ticket (simplified)
function generateTicket() {
  let ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
  let nums = Array.from({ length: 90 }, (_, i) => i + 1);

  for (let row = 0; row < 3; row++) {
    let chosen = nums.splice(0, 5);
    chosen.sort((a, b) => a - b);
    for (let i = 0; i < 5; i++) {
      ticket[row][i] = chosen[i];
    }
  }
  return ticket;
}

// Create new game
exports.createGame = async (req, res) => {
  try {
    const game = new Game({ host: req.user.id, players: [req.user.id] });
    await game.save();
    res.json({ msg: "Game created", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join a game
exports.joinGame = async (req, res) => {
  try {
    const { id } = req.params;
    let game = await Game.findById(id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (!game.players.includes(req.user.id)) {
      game.players.push(req.user.id);
      const ticket = { userId: req.user.id, numbers: generateTicket() };
      game.tickets.push(ticket);
      await game.save();
    }

    res.json({ msg: "Joined game", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get game state
exports.getGameState = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id).populate("players", "username email");
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Claim win (simplified)
exports.claimWin = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    res.json({ msg: `User ${req.user.id} claims win in game ${id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
