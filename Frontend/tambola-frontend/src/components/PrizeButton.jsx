// src/components/PrizeButtons.js
import React from "react";

const PrizeButtons = ({ prizes, onClaim, claimedPrizes }) => {
    return (
        <div className="grid grid-cols-2 gap-2">
            {prizes.map(prize => {
                const isClaimed = claimedPrizes.has(prize);
                return (
                    <button
                        key={prize}
                        className={`text-white px-3 py-2 rounded-lg transition-all font-semibold
                        ${isClaimed
                            ? 'bg-green-700 cursor-not-allowed'
                            : 'bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500'
                        }`}
                        onClick={() => onClaim(prize)}
                        disabled={isClaimed}
                    >
                        {isClaimed ? `✓ ${prize}` : prize}
                    </button>
                );
            })}
        </div>
    );
};

export default PrizeButtons;