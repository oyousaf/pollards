import React from "react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";

const NavLink = ({ to, onClick, children }) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    navigate(to, { replace: true });

    if (onClick) {
      onClick();
    }
  };

  const isActive = location.pathname === to;

  return (
    <RouterNavLink
      to={to}
      onClick={handleClick}
      className={`font-poppins font-medium cursor-pointer text-[20px] ${
        isActive ? "text-[#C3B1E1]" : "text-gray-300"
      } hover:text-gray-100`}
    >
      {children}
    </RouterNavLink>
  );
};

export default NavLink;
