import { HiArrowNarrowRight } from "react-icons/hi";
import { Link } from "react-scroll";

import pollard from '../assets/images/mr pollard.jpg'
 
const Home = () => {
  return (
    <div name="home" className="w-full h-screen bg-[#9f34b5]">
      {/* Container */}
      <div className="max-w-[1000px] mx-auto px-8 flex flex-col justify-center items-center h-full">
        <h1 className="text-4xl sm:text-7xl font-bold text-[#ccd6f6] ">
          Welcome to
        </h1>
        <h2 className="text-4xl sm:text-7xl font-bold text-[#CBC3E3]">
          Pollards Opticians
        </h2>
        <p className="text-2xl py-4 max-w-700px text-[#CBC3E3]">
          Providing innovative eye care and an exemplary service for all
        </p>

        <div>
          <Link to="about" smooth={true} duration={500}>
            <button className="text-white group border-2 rounded-3xl px-6 py-3 my-2 flex items-center border-[#CBC3E3] hover:bg-[#CBC3E3]">
              Explore
              <span className="group-hover:rotate-90 duration-300">
                <HiArrowNarrowRight className="ml-2" />
              </span>
            </button>
          </Link>
        </div>

        <div className="w-[300px] px-8 py-3 my-2 flex flex-col justify-center items-center">
          <img src={ pollard } alt="Mr Pollard"/>
        </div>
      </div>
    </div>
  )
}

export default Home