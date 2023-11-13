import React, { useState } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  return (
    <nav className="w-full flex py-6 justify-center items-center navbar">
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

      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={handleToggle}
        />

        {toggle && (
          <div className="flex p-6 bg-[#C3B1E1] absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar z-10">
            <ul className="list-none flex flex-col justify-end items-center flex-1">
              {navLinks.map((nav, index) => (
                <NavItem
                  key={nav.id}
                  href={`#${nav.id}`}
                  title={nav.title}
                  primary
                  lastItem={index === navLinks.length - 1}
                  onClick={handleToggle}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavItem = ({ href, title, primary, lastItem, onClick }) => (
  <li
    className={`font-poppins ${
      primary ? "font-bold" : "font-medium"
    } cursor-pointer text-${primary ? "[25px]" : "[20px]"} ${
      lastItem ? "mr-0" : "mr-10"
    } ${
      primary
        ? "text-primary hover:text-white"
        : "text-gray-300 hover:text-white"
    }`}
  >
    <a href={href} onClick={onClick}>
      {title}
    </a>
  </li>
);

export default Navbar;
