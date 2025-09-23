// src/TambolaRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import Cardboard from "../components/CardBoard";
import TicketGrid from "../components/TicketGrid";
import PrizeButtons from "../components/PrizeButton";

const SOCKET_URL = "http://localhost:4000"; // adjust if deployed
const prizes = [
  "Early Five",
  "Top Row",
  "Middle Row",
  "Bottom Row",
  "All Corners",
  "Full House",
];

const socket = io(SOCKET_URL, { autoConnect: false });

const TambolaRoom = () => {
  const { id: roomId } = useParams();
  const location = useLocation();
  const hostTicket = location.state?.ticket || [];
  const userId = location.state?.userId;
  console.log(userId, roomId, "locaionnn");
  // --- State ---
  const [boardNumbers, setBoardNumbers] = useState(
    Array.from({ length: 90 }, (_, i) => ({ value: i + 1, called: false }))
  );
  const [ticket, setTicket] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState(new Set());
  const [currentNumber, setCurrentNumber] = useState(null);
  const [claimedPrizes, setClaimedPrizes] = useState(new Set());
  const [isHost, setIsHost] = useState(false);
  const [gameStatus, setGameStatus] = useState("waiting"); // waiting | started | finished

  // --- Initialize ticket (host ticket if available) ---
  useEffect(() => {
    if (hostTicket.length && ticket.length === 0) {
      const formattedTicket = hostTicket.map((row) =>
        row.map((num) => ({ value: num, clicked: false }))
      );
      setTicket(formattedTicket);
    }
  }, [hostTicket]);

  // --- Socket connection & listeners ---
  useEffect(() => {
    if (!userId) return;

    socket.connect();

    socket.emit("joinRoom", { roomId, userId });

    // Receive full game state
    socket.on("gameState", (game) => {
      console.log("Game State:", game, "userId:", userId);
      setIsHost(String(userId) === String(game.host));
      setGameStatus(game.status);

      // Load ticket for current user
      const myTicket = game.tickets.find((t) => t.userId === userId);
      if (myTicket && myTicket.numbers) {
        const formattedTicket = myTicket.numbers.map((row) =>
          row.map((num) =>
            typeof num === "object" ? num : { value: num, clicked: false }
          )
        );
        setTicket(formattedTicket);

        if (myTicket.claimedPatterns)
          setClaimedPrizes(new Set(myTicket.claimedPatterns));
      }

      // Board numbers
      setCalledNumbers(new Set(game.numbersCalled));
      setBoardNumbers((prev) =>
        prev.map((n) => ({
          ...n,
          called: game.numbersCalled.includes(n.value),
        }))
      );

      setCurrentNumber(
        game.numbersCalled[game.numbersCalled.length - 1] || null
      );
    });
    
    // When a number is called by host
    socket.on("numberCalled", (number) => {
      setCalledNumbers((prev) => new Set(prev).add(number));
      setBoardNumbers((prev) =>
        prev.map((n) => (n.value === number ? { ...n, called: true } : n))
      );
      setCurrentNumber(number);
    });

    // When a prize is claimed
    socket.on("prizeClaimed", ({ prize, userId: claimer }) => {
      if (claimer === userId)
        setClaimedPrizes((prev) => new Set(prev).add(prize));
    });

    return () => {
      socket.off("gameState");
      socket.off("numberCalled");
      socket.off("prizeClaimed");
      socket.disconnect();
    };
  }, [roomId, userId]);

  // --- Event Handlers ---
  const handleStart = () => {
    console.log(isHost, roomId, "hosttt");
    if (isHost) socket.emit("startGame", { roomId });
  };

  const handleReset = () => {
    if (isHost) socket.emit("resetGame", { roomId });
  };

  const handleCallNumber = () => {
    if (!isHost) return;

    const remaining = boardNumbers.filter((n) => !n.called);
    if (remaining.length === 0) return;

    const randomNum =
      remaining[Math.floor(Math.random() * remaining.length)].value;
    socket.emit("callNumber", { roomId, number: randomNum });
  };

  const handleClaim = (prize) => {
  // Prepare ticket state: only send clicked numbers
  const clickedNumbers = ticket.flat().filter(n => n?.clicked).map(n => n.value);

  socket.emit("claimPrize", { roomId, userId, prize, clickedNumbers });
};


  // Manual marking of ticket
  const handleTicketClick = (rowIdx, colIdx) => {
    const cell = ticket[rowIdx][colIdx];
    if (!cell || !cell.value) return;

    const newTicket = ticket.map((row) => [...row]);
    newTicket[rowIdx][colIdx] = { ...cell, clicked: !cell.clicked };
    setTicket(newTicket);
  };
  
  useEffect(() => {
      // Winner notification
      socket.on("winnerDeclared", ({ userId: winnerId }) => {
        if (winnerId === userId) {
          alert("🎉 Congratulations! You won the game!");
        } else {
          alert(`🏆 Player ${winnerId} has won the game!`);
        }
      });

      return () => {
        socket.off("winnerDeclared");
      };
    }, [userId]);

  // --- Render ---
  return (
    <div className="flex h-screen bg-gray-900 text-white p-4 font-sans">
      {/* Board */}
      <div className="w-2/3 flex flex-col p-4">
        <h1 className="text-4xl font-bold text-center mb-4 text-cyan-400">
          Tambola King
        </h1>
        <Cardboard numbers={boardNumbers} />
      </div>

      {/* Ticket & Controls */}
      <div className="w-1/3 flex flex-col p-4 bg-gray-800 rounded-lg">
        {/* Current Number & Host Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <span className="text-gray-400 text-sm">CURRENT NUMBER</span>
            <div className="text-7xl font-bold text-yellow-300 w-28 h-28 flex items-center justify-center bg-gray-700 rounded-full">
              {currentNumber || "-"}
            </div>
          </div>

          {isHost && (
            <div className="flex flex-col gap-2">
              {gameStatus === "started" ? (
                <button
                  className="text-xl font-bold bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-all"
                  onClick={handleReset}
                >
                  RESET
                </button>
              ) : (
                <button
                  className="text-xl font-bold bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all"
                  onClick={handleStart}
                >
                  START
                </button>
              )}
              {gameStatus === "started" && (
                <button
                  className="text-md font-bold bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-all mt-2"
                  onClick={handleCallNumber}
                >
                  CALL NUMBER
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ticket */}
        <div className="my-4">
          <h2 className="text-xl font-semibold mb-2 text-cyan-300">
            Your Ticket
          </h2>
          <TicketGrid ticket={ticket} onCellClick={handleTicketClick} />
        </div>

        {/* Claim Prizes */}
        <div className="mt-auto">
          <h2 className="text-xl font-semibold mb-2 text-cyan-300">
            Claim a Prize
          </h2>
          <PrizeButtons
            prizes={prizes}
            onClaim={handleClaim}
            claimedPrizes={claimedPrizes}
          />
        </div>
      </div>
    </div>
  );
};

export default TambolaRoom;
