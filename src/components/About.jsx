import React from 'react'

const About = () => {
  return (
    <div name="about" className="w-full h-screen bg-[#9f34b5] text-gray-300">
      <div className="flex flex-col justify-center items-center w-full h-full">
        <div className="max-w-[1000px] w-full grid grid-cols-2 gap-8">
          <div className="sm:text-right pb-8 pl-4">
            <p className="text-4xl font-bold inline border-b-4 border-gray-400">
              About
            </p>
          </div>
          <div></div>
        </div>

        <div className="max-w-[1000px] w-full grid sm:grid-cols-2 gap-8 px-4">
          <div className="sm:text-right text-4xl font-bold pl-4">
            <p>
              Welcome! <br /> Nice to meet you! <br/>
            </p>
          </div>
          <div>
            <p>
            We are an independent opticians located in the heart of Wakefield. With strong links to Pinderfields Hospital and our investment in the latest technology, 
            we thrive on delivering personalised eye care and vision correction to the highest possible standard. We are also specialists in contact lenses and cater 
            to a range of customers to fulfil their personal visual needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About