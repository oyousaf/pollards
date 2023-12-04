import React from "react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";

const MobiLink = ({ to, onClick, children }) => {
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
      className="font-poppins font-bold cursor-pointer text-[25px] text-primary hover:text-gray-100 mb-4 transition ease-in duration-100"
    >
      {children}
    </RouterNavLink>
  );
};

export default MobiLink;
