import React from "react";
import { team } from "../constants";

import "./Bubbles.css";

const Bubbles = () => {
  return (
    <div className="relative w-full h-[300px]">
      <div className="flex justify-center items-end space-x-2">
        {team.map((member, index) => (
          <div
            key={index}
            className="flex items-end space-x-2"
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
                animation: `rotateAnimation 3s ease-in-out infinite, scaleAnimation 3s ease-in-out infinite, floatAnimation 3s ease-in-out infinite`,
              }}
            />
            <p className="text-pink-300 text-2xl justify-end items-end">
              {member.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
