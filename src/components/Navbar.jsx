import React, { useState, useEffect } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";

// Helper components
const NavItem = ({ href, title, lastItem }) => (
  <li
    className={`font-poppins font-medium cursor-pointer text-[20px] ${
      lastItem ? "mr-0" : "mr-10"
    } text-gray-300 hover:text-white`}
  >
    <a href={href}>{title}</a>
  </li>
);

const MobileMenu = ({ navLinks, onClose }) => (
  <div className="fixed inset-0 bg-primary z-[1000] p-4 overflow-y-auto">
    <div className="sticky top-0">
      <button className="text-2xl text-white" onClick={onClose}>
        Close
      </button>
      <ul className="list-none flex flex-col items-center mt-8">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className="font-poppins font-bold cursor-pointer text-[25px] text-white hover:text-gray-300 mb-4"
          >
            <a href={`#${nav.id}`} onClick={onClose}>
              {nav.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Main component
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
        isScrolled ? "bg-white shadow-lg" : ""
      }`}
    >
      <a href="https://pollards.info">
        <img src={logo} alt="pollards" className="w-[50px] h-[50px]" />
      </a>

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

      <button
        className="sm:hidden ml-auto p-2 focus:outline-none"
        onClick={handleToggle}
      >
        <img
          src={toggle || isScrolled ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
        />
      </button>

      {toggle && (
        <MobileMenu navLinks={navLinks} onClose={() => setToggle(false)} />
      )}
    </nav>
  );
};

export default Navbar;
