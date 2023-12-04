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
      className="font-poppins font-medium cursor-pointer text-[20px] text-white hover:text-[#C3B1E1] transition ease-in duration-100"
    >
      {children}
    </RouterNavLink>
  );
};

export default NavLink;
