// src/TambolaRoom.js
import React, { useState, useEffect, useCallback } from "react";
import Cardboard from "../components/CardBoard";
import TicketGrid from "../components/TicketGrid";
import PrizeButtons from "../components/PrizeButton";
import { generateValidTicket, validatePrize } from "../utils/tambola";

// --- Configuration ---
const DRAW_INTERVAL_MS = 3000; // The computer will draw a number every 3 seconds.
const prizes = ["Early Five", "Top Row", "Middle Row", "Bottom Row", "All Corners", "Full House"];


const TambolaRoom = () => {
    // --- State Management ---
    const [boardNumbers, setBoardNumbers] = useState(() =>
        Array.from({ length: 90 }, (_, i) => ({ value: i + 1, called: false }))
    );
    const [ticket, setTicket] = useState(() => generateValidTicket());
    const [calledNumbers, setCalledNumbers] = useState(() => new Set());
    const [currentNumber, setCurrentNumber] = useState(null);
    const [claimedPrizes, setClaimedPrizes] = useState(() => new Set());
    const [isRunning, setIsRunning] = useState(false); // New state to control the game flow

    // --- Core Game Logic ---

    const drawNumber = useCallback(() => {
        const remaining = boardNumbers.filter(n => !n.called);
        if (remaining.length === 0) {
            setIsRunning(false);
            return;
        }
        const randomNumObj = remaining[Math.floor(Math.random() * remaining.length)];

        setBoardNumbers(prev =>
            prev.map(n => (n.value === randomNumObj.value ? { ...n, called: true } : n))
        );
        setCurrentNumber(randomNumObj.value);
        setCalledNumbers(prev => new Set(prev).add(randomNumObj.value));
    }, [boardNumbers]);

    // --- Effects ---
    useEffect(() => {
        if (!isRunning) {
            return;
        }
        const gameInterval = setInterval(() => {
            drawNumber();
        }, DRAW_INTERVAL_MS);
        return () => clearInterval(gameInterval);
    }, [isRunning, drawNumber]);

    // --- THE AUTO-MARKING useEffect BLOCK HAS BEEN REMOVED FROM HERE ---

    // --- Event Handlers ---
    const handleTicketClick = (rowIdx, colIdx) => {
        const clickedCell = ticket[rowIdx][colIdx];
        if (!clickedCell) return; // Ignore clicks on empty cells

        // Logic for marking a number
        const newTicket = ticket.map(row => [...row]);
        newTicket[rowIdx][colIdx].clicked = !newTicket[rowIdx][colIdx].clicked;
        setTicket(newTicket);
    };

    const handleClaim = (prize) => {
        if (validatePrize(prize, ticket, calledNumbers)) {
            alert(`Congratulations! You've successfully claimed ${prize}!`);
            setClaimedPrizes(prev => new Set(prev).add(prize));
        } else {
            alert(`Claim for ${prize} is not valid. Keep playing!`);
        }
    };

    const resetGame = useCallback(() => {
        setIsRunning(false);
        setBoardNumbers(Array.from({ length: 90 }, (_, i) => ({ value: i + 1, called: false })));
        setTicket(generateValidTicket());
        setCalledNumbers(new Set());
        setCurrentNumber(null);
        setClaimedPrizes(new Set());
    }, []);

    // --- Render ---
    return (
        <div className="flex h-screen bg-gray-900 text-white p-4 font-sans">
            <div className="w-2/3 flex flex-col p-4">
                <h1 className="text-4xl font-bold text-center mb-4 text-cyan-400">Tambola King</h1>
                <Cardboard numbers={boardNumbers} />
            </div>

            <div className="w-1/3 flex flex-col p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                        <span className="text-gray-400 text-sm">CURRENT NUMBER</span>
                        <div className="text-7xl font-bold text-yellow-300 w-28 h-28 flex items-center justify-center bg-gray-700 rounded-full">
                            {currentNumber || "-"}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {isRunning ? (
                             <button
                                className="text-xl font-bold bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-all"
                                onClick={() => setIsRunning(false)}
                            >
                                PAUSE
                            </button>
                        ) : (
                             <button
                                className="text-xl font-bold bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-600"
                                onClick={() => setIsRunning(true)}
                                disabled={calledNumbers.size === 90}
                            >
                                START
                            </button>
                        )}
                        <button
                            className="text-md font-bold bg-gray-500 text-white px-8 py-2 rounded-lg hover:bg-gray-600 transition-all"
                            onClick={resetGame}
                        >
                            Reset Game
                        </button>
                    </div>
                </div>

                <div className="my-4">
                    <h2 className="text-xl font-semibold mb-2 text-cyan-300">Your Ticket</h2>
                    <TicketGrid ticket={ticket} onCellClick={handleTicketClick} />
                </div>

                <div className="mt-auto">
                    <h2 className="text-xl font-semibold mb-2 text-cyan-300">Claim a Prize</h2>
                    <PrizeButtons prizes={prizes} onClaim={handleClaim} claimedPrizes={claimedPrizes} />
                </div>
            </div>
        </div>
    );
};

export default TambolaRoom;     