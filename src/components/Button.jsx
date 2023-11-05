import React from "react";

const Button = ({ styles }) => {
  return (
    <a href="tel:01924373697">
      <button
        type="button"
        className={`py-4 px-6 bg-[#C3B1E1] transition duration-300 hover:bg-primary font-poppins font-medium text-[18px] rounded-[10px] hover:text-gray-100 text-primary outline-none ${styles}`}
      >
        Book an appointment
      </button>
    </a>
  );
};

export default Button;
