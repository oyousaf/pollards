import React, { useEffect } from "react";
import styles from "../style";
import { discount, mrpollard } from "../assets";
import Explore from "./Explore";

const Hero = () => {
  useEffect(() => {
    // Preload LCP Image
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = "/assets/mrpollard-1015638e.webp";
    document.head.appendChild(link);

    return () => {
      // Cleanup: remove the link when the component unmounts
      document.head.removeChild(link);
    };
  }, []);

  return (
    <section
      id="home"
      className={`flex md:flex-row flex-col ${styles.paddingY} mt-[100px]`}
    >
      <div
        className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}
      >
        <div className="flex flex-row items-center py-[6px] px-4 bg-[#C3B1E1] rounded-[10px] mb-2">
          <img src={discount} alt="discount" className="w-[32px] h-[32px]" />
          <p className={`${styles.paragraph} ml-2`}>
            <span className="text-[#002D04]">
              Providing innovative eye care and an exemplary service for all
            </span>
          </p>
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <h1 className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-gray-300 ss-leading-[100px] leading-[72px]">
            Pollards Opticians
            <br className="sm:block hidden" />{" "}
          </h1>
          <div className="ss:flex hidden md:mr-4 mr-0">
            <Explore />
          </div>
        </div>
        <p className={`${styles.paragraph} max-w-[570px] mt-5 text-white`}>
          Visionaries see beyond the boundaries of eyesight
        </p>
      </div>

      <div
        className={`flex-1 flex ${styles.flexCenter} md:my-0 my-10 relative`}
      >
        <img
          src={mrpollard}
          alt="mrpollard"
          className="w-[200px] md:w-[400px] z-[5] relative rounded-xl mr-3"
        />
        <div className={`ss:hidden ${styles.flexCenter}`}>
          <Explore />
        </div>
      </div>
    </section>
  );
};

export default Hero;
