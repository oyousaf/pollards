import React, { useState, useEffect } from "react";
import { close, logo, menu } from "../assets";
import { navLinks, socialMedia } from "../constants";

const NavItem = ({ href, title, lastItem }) => (
  <li
    className={`font-poppins font-medium cursor-pointer text-[20px] ${
      lastItem ? "mr-0" : "mr-10"
    } text-gray-300 hover:text-white`}
  >
    <a href={href}>{title}</a>
  </li>
);

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`w-full flex py-6 justify-center items-center navbar ${
        isScrolled ? "bg-primary shadow-lg" : ""
      }`}
    >
      <a href="https://pollards.info" className="mr-[100px]">
        <img src={logo} alt="pollards" className="w-[50px] h-[50px]" />
      </a>

      {/* Desktop navigation */}
      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <NavItem
            key={nav.id}
            href={`#${nav.id}`}
            title={nav.title}
            lastItem={index === navLinks.length - 1}
          />
        ))}
      </ul>

      {/* Mobile menu button */}
      <button
        className="sm:hidden ml-auto p-2 focus:outline-none font-bold"
        onClick={handleToggle}
      >
        <img
          src={menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
        />
      </button>

      {/* Mobile menu content */}
      {toggle && (
        <div className="fixed inset-0 bg-[#C3B1E1] z-[1000] p-4 overflow-y-auto">
          <button
            className="text-2xl text-primary"
            onClick={() => setToggle(false)}
          >
            <img src={close} className="absolute right-5" alt="close" />
          </button>
          <ul className="list-none flex flex-col items-center mt-8">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className="font-poppins font-bold cursor-pointer text-[25px] text-primary hover:text-gray-100 mb-4"
              >
                <a
                  href={`#${nav.id}`}
                  onClick={() => {
                    setToggle(false);
                  }}
                >
                  {nav.title}
                </a>
              </li>
            ))}
          </ul>

          <div className="w-full flex flex-col justify-between items-center pt-6">
            <p className="flex flex-row bottom-0">
              {socialMedia.map((social, index) => (
                <a key={social.id} href={social.link} target={social.target}>
                  <img
                    key={social.id}
                    src={social.icon}
                    alt={social.id}
                    className={`w-[30px] h-[30px] object-contain cursor-pointer ${
                      index !== socialMedia.length - 1 ? "mr-6" : "mr-0"
                    }`}
                  />
                </a>
              ))}
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
