import React, { useEffect, useState } from "react";

import styles from "../style";
import { logo } from "../assets";

import socialMedia from "./SocialMedia";
import Gmap from "./Gmap";
import { FaArrowUp } from "react-icons/fa";

const Footer = () => {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.scrollY > 400) {
      setShowScroll(true);
    } else if (showScroll && window.scrollY <= 400) {
      setShowScroll(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showScroll]);

  return (
    <section
      id="contact"
      className={`${styles.flexCenter} ${styles.paddingY} flex-col font-poppins border-t-[1px] border-t-[#c3b1e1]`}
    >
      <Gmap />

      <div className={`${styles.flexStart} mb-8 pt-6 w-full`}>
        <div className="flex-1 flex flex-col justify-center items-center">
          <a href="https://pollards.info">
            <img
              src={logo}
              alt="pollards"
              className="w-[50px] h-[50px] object-contain"
            />
          </a>
          <p className={`${styles.paragraph} mt-4 max-w-[310px]`}>
            Connect with us
          </p>
          <div className="w-full flex flex-col justify-between items-center pt-6">
            <p className="flex flex-row">
              {socialMedia.map((social, index) => (
                <a
                  key={social.id}
                  href={social.link}
                  target={social.target}
                  title={social.id}
                  className={`text-3xl text-white hover:text-[#C3B1E1] transition ease-in duration-100 object-contain cursor-pointer ${
                    index !== socialMedia.length - 1 ? "mr-6" : ""
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </p>
          </div>
          <div className="w-full flex flex-col justify-between items-center pt-6">
            <p className="font-medium text-[20px] leading-[27px] text-white pt-6">
              &copy; {new Date().getFullYear()} Pollards Opticians
            </p>
          </div>

          {showScroll && (
            <button
              className="bg-[#C3B1E1] text-[#002D04] hover:text-white text-2xl md:text-4xl p-2 rounded-full transition ease-in duration-300 fixed bottom-7 right-7 z-50"
              onClick={scrollToTop}
            >
              <FaArrowUp />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Footer;
