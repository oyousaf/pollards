import React from "react";
import { team } from "../constants";

import "./Bubbles.css";

const Bubbles = () => {
  return (
    <div className="relative w-full h-[300px] overflow-hidden">
      <div className="flex justify-center items-center space-x-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center space-x-2"
            style={{
              animation: "floatAnimation 3s ease-in-out infinite",
            }}
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-16 h-16 rounded-full"
              style={{
                animation: `rotateAnimation 3s ease-in-out infinite, scaleAnimation 3s ease-in-out infinite, floatAnimation 3s ease-in-out infinite`,
              }}
            />
            <p className="text-pink-300 text-2xl">{member.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
