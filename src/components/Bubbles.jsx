import React from "react";
import { useSpring, animated } from "react-spring";
import { useHover } from "react-use-gesture";

import { team } from "../constants";

const Bubbles = () => {
  const [springProps, set, stop] = useSpring(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  }));

  const bind = useHover(({ hovering }) => {
    set({
      x: hovering ? Math.random() * window.innerWidth : springProps.x,
      y: hovering ? Math.random() * window.innerHeight : springProps.y,
    });
  });

  React.useEffect(() => {
    return stop;
  }, [stop]);

  return (
    <div>
      {team.map((member, index) => (
        <animated.div
          key={index}
          className="left-[calc(var(--x)/16)] top-[calc(var(--y)/16)] cursor-pointer"
          {...bind()}
        >
          <div className="p-4 bg-black bg-opacity-80 rounded-md">
            <img
              src={member.image}
              alt="Bubble"
              className="w-12 h-12 rounded-full"
            />
            <p className="text-white">{member.name}</p>
          </div>
        </animated.div>
      ))}
    </div>
  );
};

export default Bubbles;
