import React from "react";
import { team } from "../constants";

import "./Bubbles.css";

const Bubbles = () => {
  return (
    <div className="relative w-full h-[300px]">
      <div className="flex justify-center items-center space-x-2">
        {team.map((member, index) => (
          <div
            key={index}
            className="flex flex-col items-center space-x-2"
            style={{
              animation: "floatAnimation 3s ease-in-out infinite",
              animationDelay: `${index * 0.2}s`,
            }}
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-30 h-30 rounded-full"
              style={{
                animation: `floatAnimation 3s ease-in-out infinite`,
              }}
            />
            <p className="text-gray-100 text-2xl italic">{member.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
