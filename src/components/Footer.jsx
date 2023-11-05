import React from "react";
import dotenv from "dotenv";

import styles from "../style";
import { logo } from "../assets";
import { socialMedia } from "../constants";

const Footer = () => (
  <section
    id="contact"
    className={`${styles.flexCenter} ${styles.paddingY} flex-col font-poppins border-t-[1px] border-t-[#c3b1e1]`}
  >
    <div className={`${styles.flexStart} mb-8 w-full`}>
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
              <a key={social.id} href={social.link} target={social.target}>
                <img
                  key={social.id}
                  src={social.icon}
                  alt={social.id}
                  className={`w-[21px] h-[21px] object-contain cursor-pointer ${
                    index !== socialMedia.length - 1 ? "mr-6" : "mr-0"
                  }`}
                />
              </a>
            ))}
          </p>
        </div>
        <div className="w-full flex flex-col justify-between items-center pt-6">
          <p className="font-medium flex-row text-[18px] leading-[27px] text-white pt-6">
            &copy; {new Date().getFullYear()} Pollards Opticians
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Footer;
