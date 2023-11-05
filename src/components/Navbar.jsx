import { React, useState, useEffect } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [isSticky, setisSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setisSticky(true);
      } else {
        setisSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`${
        isSticky
          ? "fixed bg-primary z-[1000] w-full flex py-3 shadow-lg transition-shadow duration-300 ease-in"
          : "w-full flex py-6 justify-center items-center navbar"
      }`}
    >
      <a href="https://pollards.info">
        <img src={logo} alt="pollards" className="w-[50px] h-[50px]" />
      </a>
      <ul
        className={`list-none sm:flex hidden justify-${
          isSticky ? "center" : "end"
        } items-center flex-1`}
      >
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-medium cursor-pointer text-[20px] ${
              index === navLinks.length - 1 ? "mr-0" : "mr-10"
            } text-gray-300 hover:text-white`}
          >
            <a href={`#${nav.id}`}>{nav.title}</a>
          </li>
        ))}
      </ul>

      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle((prev) => !prev)}
        />

        <div
          className={`${
            toggle ? "flex" : "hidden"
          } p-6 bg-[#C3B1E1] absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar z-10`}
        >
          <ul className="list-none flex flex-col justify-end items-center flex-1">
            {navLinks.map((nav, index) => (
              <li
                onClick={() => setToggle((prev) => !prev)}
                key={nav.id}
                className={`font-poppins font-bold cursor-pointer text-[25px] text-primary hover:text-white ${
                  index === navLinks.length - 1 ? "mr-0" : "mb-4"
                }`}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
