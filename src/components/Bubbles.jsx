import React from "react";
import { useSpring, animated } from "react-spring";
import { useHover } from "react-use-gesture";

import { team } from "../constants";

const Bubbles = () => {
  const [springProps, set] = useSpring(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  }));

  const bind = useHover(({ hovering }) => {
    set({
      x: hovering ? Math.random() * window.innerWidth : springProps.x,
      y: hovering ? Math.random() * window.innerHeight : springProps.y,
    });
  });

  return (
    <div
      className="absolute left-[calc(var(--x)/16)] top-[calc(var(--y)/16)] cursor-pointer"
      {...bind()}
    >
      <div className="p-4 bg-black bg-opacity-80 rounded-md">
        <img
          src={team[0].image}
          alt="Bubble"
          className="w-12 h-12 rounded-full"
        />
        <p className="text-white">{team[0].name}</p>
      </div>
    </div>
  );
};

export default Bubbles;
