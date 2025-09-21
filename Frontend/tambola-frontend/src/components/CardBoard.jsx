// src/components/Cardboard.js
import React from "react";

const Cardboard = ({ numbers }) => {
    return (
        <div className="w-full grid grid-cols-10 gap-2 bg-gray-800 p-4 rounded-lg flex-grow">
            {numbers.map(({ value, called }) => (
                <div
                    key={value}
                    className={`flex items-center justify-center rounded-md text-xl font-semibold transition-colors duration-300
                    ${called ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
                >
                    {value}
                </div>
            ))}
        </div>
    );
};

export default Cardboard;