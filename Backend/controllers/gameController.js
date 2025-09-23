const Game = require("../models/game");
const _ = require("lodash");

// ----------------- Helper: Generate Valid Tambola Ticket -----------------
function generateTicket() {
   function sampleSize(arr, size) {
    const shuffled = [...arr]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled.slice(0, size);
  }

  let ticket;
  let isValid = false;

  // --- Step 1: Generate a valid layout ---
  // The layout determines where numbers will be placed. We keep trying until we
  // generate a layout that meets all row and column constraints.
  do {
    // Start with a blank 3x9 grid. 1 means a number will be placed here.
    const layout = Array.from({ length: 3 }, () => Array(9).fill(0));
    const columnIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // Rule: Each row must have exactly 5 numbers.
    // So, for each row, we randomly select 5 columns to place numbers in.
    for (let r = 0; r < 3; r++) {
      const chosenCols = sampleSize(columnIndices, 5);
      for (const c of chosenCols) {
        layout[r][c] = 1;
      }
    }

    // Validate the layout against column rules.
    const colCounts = Array(9).fill(0);
    for (let c = 0; c < 9; c++) {
      for (let r = 0; r < 3; r++) {
        colCounts[c] += layout[r][c];
      }
    }

    // Rule: Total numbers must be 15 (which is guaranteed by the row logic).
    // Rule: Each column must have at least one number and no more than three.
    const allColsValid = colCounts.every(count => count >= 1 && count <= 3);

    if (allColsValid) {
      isValid = true;
      ticket = layout; // This layout is valid, so we'll use it.
    }
  } while (!isValid);

  // --- Step 2: Fill the valid layout with numbers ---
  for (let c = 0; c < 9; c++) {
    // Count how many numbers this column needs based on our valid layout.
    let countInCol = 0;
    for (let r = 0; r < 3; r++) {
      if (ticket[r][c] === 1) {
        countInCol++;
      }
    }

    if (countInCol === 0) continue;

    // Define the number range for the current column.
    const min = c * 10 + (c === 0 ? 1 : 0);
    const max = c * 10 + 9;
    const finalMax = (c === 8) ? 90 : max; // Last column goes up to 90.

    // Generate all possible numbers for the column.
    const possibleNumbers = [];
    for (let i = min; i <= finalMax; i++) {
      possibleNumbers.push(i);
    }

    // Randomly pick the required amount of numbers.
    const chosenNumbers = sampleSize(possibleNumbers, countInCol);

    // Rule: Numbers in a column must be sorted top-to-bottom.
    chosenNumbers.sort((a, b) => a - b);

    // Place the sorted numbers into the ticket grid.
    let numIndex = 0;
    for (let r = 0; r < 3; r++) {
      if (ticket[r][c] === 1) {
        ticket[r][c] = chosenNumbers[numIndex];
        numIndex++;
      }
    }
  }

  // --- Step 3: Finalize the ticket ---
  // Replace the remaining placeholders (0) with null for empty cells.
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      if (ticket[r][c] === 0) {
        ticket[r][c] = null;
      }
    }
  }

  return ticket;}

// ----------------- Helper: Generate Unique Room ID -----------------
function generateRoomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function createUniqueRoomId() {
  let id;
  let exists = true;
  while (exists) {
    id = generateRoomId();
    exists = await Game.findOne({ roomId: id });
  }
  return id;
}

// ----------------- CREATE GAME -----------------
exports.createGame = async (req, res) => {
  try {
    const roomId = await createUniqueRoomId();

    const hostTicket = {
      userId: req.user.id,
      numbers: generateTicket(),
      claimedPatterns: []
    };

    const game = new Game({
      host: req.user.id,
      players: [req.user.id],
      tickets: [hostTicket],
      roomId,
      status: "waiting",
      numbersCalled: []
    });

    await game.save();
    res.json({ msg: "Game created", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- JOIN GAME -----------------
exports.joinGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const game = await Game.findOne({ roomId });
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (!game.players.includes(req.user.id)) {
      game.players.push(req.user.id);
      const ticket = { userId: req.user.id, numbers: generateTicket(), claimedPatterns: [] };
      game.tickets.push(ticket);
      await game.save();
    }

    res.json({ msg: "Joined game", game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- GET GAME STATE -----------------
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
        claimedPatterns: t.claimedPatterns
      })),
      createdBy: game.host
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------- CLAIM WIN (with backend validation) -----------------
exports.claimWin = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { pattern } = req.body;
    const userId = req.user.id;

    const game = await Game.findOne({ roomId });
    if (!game) return res.status(404).json({ error: "Game not found" });

    const ticket = game.tickets.find(t => t.userId.toString() === userId.toString());
    if (!ticket) return res.status(400).json({ error: "Ticket not found" });
    if (ticket.claimedPatterns.includes(pattern)) return res.status(400).json({ error: "Pattern already claimed" });

    const ticketNumbers = ticket.numbers.flat().filter(Boolean);
    const calledSet = new Set(game.numbersCalled);

    // ----------------- Pattern Validation -----------------
    let valid = false;
    switch (pattern) {
      case "Early Five":
        valid = ticketNumbers.filter(n => calledSet.has(n.value)).length >= 5;
        break;
      case "Top Row":
        valid = ticket.numbers[0].filter(Boolean).every(n => calledSet.has(n.value));
        break;
      case "Middle Row":
        valid = ticket.numbers[1].filter(Boolean).every(n => calledSet.has(n.value));
        break;
      case "Bottom Row":
        valid = ticket.numbers[2].filter(Boolean).every(n => calledSet.has(n.value));
        break;
      case "All Corners":
        const corners = [
          ticket.numbers[0][0],
          ticket.numbers[0][8],
          ticket.numbers[2][0],
          ticket.numbers[2][8]
        ].filter(Boolean);
        valid = corners.every(n => calledSet.has(n.value));
        break;
      case "Full House":
        valid = ticketNumbers.every(n => calledSet.has(n.value));
        break;
      default:
        return res.status(400).json({ error: "Invalid pattern" });
    }

    if (!valid) return res.status(400).json({ error: "Pattern not valid yet!" });

    ticket.claimedPatterns.push(pattern);
    await game.save();

    res.json({ msg: `Pattern '${pattern}' claimed successfully!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
