import React from "react";

const Gmap = () => {
  const latitude = 53.68284408412487;
  const longitude = -1.4990073382300537;

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAGxUo0VsJc0lDtVEN94u8Rv_yE9u9p7fo&q=Pollards+Opticians&center=${latitude},${longitude}&zoom=19`;

  return (
    <div className="w-full h-96 mb-[30px]">
      <iframe
        className="rounded-xl w-full"
        title="Pollards Opticians"
        width="100%"
        height="100%"
        src={mapUrl}
      />
    </div>
  );
};

export default Gmap;
