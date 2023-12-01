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

  return (
    <RouterNavLink
      to={to}
      onClick={handleClick}
      className="font-poppins font-medium cursor-pointer text-[20px] text-white hover:text-gray-100 active:text-[#C3B1E1]"
    >
      {children}
    </RouterNavLink>
  );
};

export default NavLink;
