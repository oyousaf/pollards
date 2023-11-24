import React, { useState, useEffect } from "react";
import NavLink from "./NavLink";
import MobiLink from "./MobiLink";
import { logo, menu, close } from "../assets";
import { navLinks } from "../constants";
import socialMedia from "./SocialMedia";

const Nav = () => {
  const [scrolling, setScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
          {navLinks.map((nav) => (
            <NavLink
              key={nav.id}
              href={nav.to}
              onClick={() => scrollToSection(nav.to)}
            >
              {nav.title}
            </NavLink>
          ))}
        </div>

        {/* Hamburger menu for mobile */}
        <div className="sm:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <img src={menu} alt="menu" className="w-[28px] h-[28px]" />
          </button>
          {mobileMenuOpen && (
            <div
              className={`fixed inset-0 bg-[#C3B1E1] p-4 overflow-y-auto transition-transform transform ${
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <button
                className="text-2xl text-primary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <a href="https://pollards.info">
                  <img src={logo} alt="logo" className="w-[50px] h-[50px]" />
                </a>
                <img
                  src={close}
                  className="absolute right-5 w-[28px] h-[28px]"
                  alt="close"
                />
              </button>

              <ul className="list-none flex flex-col items-center pt-[200px]">
                {navLinks.map((nav) => (
                  <MobiLink
                    key={nav.id}
                    href={nav.to}
                    onClick={() => {
                      scrollToSection(nav.to);
                      setMobileMenuOpen(!mobileMenuOpen);
                    }}
                  >
                    {nav.title}
                  </MobiLink>
                ))}
              </ul>

              <div className="w-full flex flex-col justify-between items-center pt-[175px]">
                <p className="flex flex-row bottom-0">
                  {socialMedia.map((social, index) => (
                    <a
                      key={social.id}
                      href={social.link}
                      target={social.target}
                      className={`w-[30px] h-[30px] font-bold text-3xl text-gray-100 hover:text-primary object-contain cursor-pointer ${
                        index !== socialMedia.length - 1 ? "mr-6" : "mr-0"
                      }`}
                    >
                      {social.icon}
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
