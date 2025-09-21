const express = require("express");
const { createGame, joinGame, getGameState, claimWin } = require("../controllers/gameController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// protected routes
router.post("/create", authMiddleware, createGame);
router.post("/:id/join", authMiddleware, joinGame);
router.get("/:id/state", authMiddleware, getGameState);
router.post("/:id/claim", authMiddleware, claimWin);

module.exports = router;
