import React from "react";
import styles from "../style";
import { BsArrowDownShort } from "react-icons/bs";

const Explore = () => (
  <a href="#about">
    <div
      className={`${styles.flexCenter} w-[140px] h-[140px] rounded-full bg-pink-gradient p-[2px] cursor-pointer`}
    >
      <div
        className={`${styles.flexCenter} flex-col bg-[#C3B1E1] w-[100%] h-[100%] rounded-full`}
      >
        <div className={`${styles.flexStart} flex-row`}>
          <p className="font-poppins font-medium text-[18px] leading-[23px]">
            <span className="text-gray-100 text-center">Explore</span>

            <BsArrowDownShort className="ml-3 w-[40px] h-[40px] animate-bounce text-primary hover:text-white" />
          </p>
        </div>
      </div>
    </div>
  </a>
);

export default Explore;
