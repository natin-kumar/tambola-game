const express = require("express");
const { createGame, joinGame, getGameState, claimWin } = require("../controllers/gameController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// CREATE GAME
router.post("/create", authMiddleware, createGame);

// JOIN GAME
router.post("/join/:roomId", authMiddleware, joinGame);

// GET GAME STATE
router.get("/:roomId/state", authMiddleware, getGameState);

// CLAIM WIN
router.post("/:roomId/claim", authMiddleware, claimWin);

module.exports = router;
