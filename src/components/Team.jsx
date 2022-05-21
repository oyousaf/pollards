import React from 'react'
import Denise from "../assets/images/1.png";
import Emma from "../assets/images/2.png";
import Fizz from "../assets/images/3.png";

const Team = () => {
  return (
    <div name="team" className="w-full h-screen bg-[#9f34b5] text-gray-300">
      {/*Container*/}
      <div className="max-w-[1000px] mx-auto p-4 flex flex-col justify-center w-full h-full">
        <div>
          <p className="text-4xl font-bold inline border-b-4 border-gray-400">
            Meet the Squad
          </p>
          <p className="py-4">
            Our lovely squad members
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-4 text-center py-8">
          <div className="shadow-md shadow-[#265B5F] hover:scale-110 duration-500">
            <img className="mx-auto" src={Denise} alt="Denise" />
            <p className="my-4">Denise</p>
            <p className="my-4">Optics Dispenser</p>
          </div>
          <div className="shadow-md shadow-[#265B5F] hover:scale-110 duration-500">
            <img className="mx-auto" src={Emma} alt="Emma" />
            <p className="my-4">Emma</p>
            <p className="my-4">Optics Dispenser</p>
          </div>
          <div className="shadow-md shadow-[#265B5F] hover:scale-110 duration-500">
            <img className="mx-auto" src={Fizz} alt="Fizz"
            />
            <p className="my-4">Fizz</p>
            <p className="my-4">Lead Optometrist</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Team