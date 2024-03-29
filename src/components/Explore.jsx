import React from "react";
import styles from "../style";
import { BsArrowDownShort } from "react-icons/bs";
import { Link } from "react-router-dom";

const scrollToSection = (id) => {
  const element = document.getElementById(id.substring(1));
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const Explore = () => (
  <Link title="about" onClick={() => scrollToSection("#about")}>
    <div
      className={`${styles.flexCenter} w-[100px] h-[100px] rounded-full bg-pink-gradient p-[2px] cursor-pointer`}
    >
      <div
        className={`${styles.flexCenter} flex-col bg-[#C3B1E1] w-[100%] h-[100%] rounded-full text-[#002D04] hover:text-white text-center transition ease-in duration-300`}
      >
        <div className={`${styles.flexStart} flex-row`}>
          <p className="font-poppins font-bold text-[18px] leading-[23px]">
            <BsArrowDownShort className="w-[70px] h-[70px] text-bold animate-bounce" />
          </p>
        </div>
      </div>
    </div>
  </Link>
);

export default Explore;
