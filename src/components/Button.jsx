import React from "react";

const Button = ({ styles }) => {
  return (
    <a href="tel:01924373697">
      <button
        type="button"
        className={`py-4 px-6 bg-[#C3B1E1] hover:bg-[#002D04] text-[#002D04] hover:text-white transition duration-300 font-poppins font-medium text-[18px] rounded-[10px] outline-none ${styles}`}
      >
        Book an appointment
      </button>
    </a>
  );
};

export default Button;
