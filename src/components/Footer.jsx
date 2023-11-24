import React from "react";

import styles from "../style";
import { logo } from "../assets";
import socialMedia from "./SocialMedia";
import Gmap from "./Gmap";

const Footer = () => (
  <section
    id="contact"
    className={`${styles.flexCenter} ${styles.paddingY} flex-col font-poppins border-t-[1px] border-t-[#c3b1e1]`}
  >
    <Gmap />

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
              <a
                key={social.id}
                href={social.link}
                target={social.target}
                className={`text-3xl text-gray-100 hover:text-[#C3B1E1] object-contain cursor-pointer ${
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
      </div>
    </div>
  </section>
);

export default Footer;
