// src/components/TicketGrid.js
import React from "react";

const TicketGrid = ({ ticket, onCellClick }) => {
    return (
        <div className="grid grid-cols-9 gap-1 p-2 bg-gray-900 rounded-md">
            {ticket.map((row, rIdx) =>
                row.map((cell, cIdx) => (
                    <div
                        key={`${rIdx}-${cIdx}`}
                        className={`relative w-full aspect-square flex items-center justify-center rounded-md font-bold text-lg transition-all duration-300 ease-in-out
                        ${cell ? 'bg-gray-700 border border-gray-600 cursor-pointer' : 'bg-gray-800'}
                        ${cell?.clicked ? 'text-gray-900' : 'text-white'}`}
                        onClick={() => cell && onCellClick(rIdx, cIdx)}
                    >
                        <span className="z-10">{cell?.value}</span>
                        {cell?.clicked && (
                            <div className="absolute inset-0 bg-yellow-400 rounded-md transform scale-100 transition-transform duration-300 z-0"></div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default TicketGrid;