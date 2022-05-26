import React from "react";
import { data } from "../constants/images";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

const Gallery = () => {

  const slideLeft = () => {
    var slider = document.getElementById('slider')
    slider.scrollLeft = slider.scrollLeft - 500
  }

  const slideRight = () => {
    var slider = document.getElementById('slider')
    slider.scrollLeft = slider.scrollLeft + 500
  }

  return (
    <div name="gallery" className="w-full h-screen bg-[#9f34b5] text-gray-300">
      <div className="max-w-[1000px] mx-auto p-4 flex flex-col justify-center w-full h-full">
        <div className="pb-8">
          <p className="text-4xl font-bold inline border-b-4 border-gray-400">
            Gallery
          </p>
          <p className="py-6">Collage of memories</p>
        </div>

        <div className="relative flex items-center">
          <MdChevronLeft className="opacity-50 cursor-pointer hover:opacity-100" onClick={slideLeft} size={40}/>
            <div id="slider" className="w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide">
            {data.map((item) => (
                <img 
                className="w-[300px] inline-block p-2 cursor-pointer hover:scale-105 ease-in-out duration-300"
                src={item.img}
                alt='gallery' 
                />
            ))}
            </div>  
          <MdChevronRight className="opacity-50 cursor-pointer hover:opacity-100" onClick={slideRight} size={40} />
        </div>     
        
      </div>
    </div>
  );
};

export default Gallery;