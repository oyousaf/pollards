import React, { useState, useEffect } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";

const NavItem = ({ href, title, lastItem }) => (
  <li
    className={`font-poppins font-medium cursor-pointer text-[20px] ${
      lastItem ? "mb-0" : "mb-4"
    } text-primary hover:text-white`}
  >
    <a href={href}>{title}</a>
  </li>
);

const MobileMenu = ({ navLinks, onClose }) => (
  <div className="fixed inset-0 bg-[#C3B1E1] z-[1000] flex items-center justify-center">
    <div className="absolute top-0 right-0 p-4">
      <button className="w-[28px] h-[28px] text-white" onClick={onClose}>
        <img src={close} alt="close" className="w-full h-full" />
      </button>
    </div>
    <div className="sticky top-1/2 transform -translate-y-1/2 p-4 text-center">
      <ul className="list-none flex flex-col items-center space-y-4">
        {navLinks.map((nav, index) => (
          <NavItem
            key={nav.id}
            href={`#${nav.id}`}
            title={nav.title}
            lastItem={index === navLinks.length - 1}
          />
        ))}
      </ul>
    </div>
  </div>
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
