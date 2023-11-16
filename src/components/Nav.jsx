import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavLink from "./NavLink";
import MobiLink from "./MobiLink";

import { logo, menu, close } from "../assets";
import { navLinks, socialMedia } from "../constants";

const Nav = () => {
  const location = useLocation();
  const [scrolling, setScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (route) => location.pathname === route;

  const scrollToSection = (id) => {
    const element = document.getElementById(id.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`bg-primary fixed top-0 left-0 right-0 z-[1000] p-4 rounded ${
        scrolling ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="https://pollards.info">
            <img src={logo} alt="logo" className="w-[50px] h-[50px]" />
          </a>
        </div>

        <div className="hidden sm:flex items-center space-x-6">
          <NavLink
            to="/home"
            onClick={() => scrollToSection("/home")}
            active={isActive("/home")}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => scrollToSection("/about")}
            active={isActive("/about")}
          >
            About
          </NavLink>
          <NavLink
            to="/team"
            onClick={() => scrollToSection("/team")}
            active={isActive("/team")}
          >
            Team
          </NavLink>
          <NavLink
            to="/review"
            onClick={() => scrollToSection("/review")}
            active={isActive("/review")}
          >
            Review
          </NavLink>
          <NavLink
            to="/info"
            onClick={() => scrollToSection("/info")}
            active={isActive("/info")}
          >
            Info
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => scrollToSection("/contact")}
            active={isActive("/contact")}
          >
            Contact
          </NavLink>
        </div>

        {/* Hamburger menu for mobile */}
        <div className="sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xl text-gray-700 focus:outline-none"
          >
            <img src={menu} alt="menu" className="w-[28px] h-[28px]" />
          </button>
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-[#C3B1E1] p-4 overflow-y-auto">
              <button
                className="text-2xl text-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <img
                  src={close}
                  className="absolute right-5 w-[28px] h-[28px]"
                  alt="close"
                />
              </button>

              <ul className="list-none flex flex-col items-center mt-8">
                {navLinks.map((nav) => (
                  <MobiLink
                    key={nav.id}
                    to={nav.to}
                    onClick={() => {
                      scrollToSection(nav.to);
                      setMobileMenuOpen(!mobileMenuOpen);
                    }}
                  >
                    {nav.title}
                  </MobiLink>
                ))}
              </ul>

              <div className="w-full flex flex-col justify-between items-center pt-6">
                <p className="flex flex-row bottom-0">
                  {socialMedia.map((social, index) => (
                    <a
                      key={social.id}
                      href={social.link}
                      target={social.target}
                    >
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
        </div>
      </div>
    </nav>
  );
};

export default Nav;
