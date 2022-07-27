import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const Info = () => {
  return (
    <div name="info" className="w-full h-screen bg-[#9f34b5] text-gray-300">
        <div className="max-w-[1000px] mx-auto p-4 flex flex-col justify-center w-full h-full">
            <div className="pb-8">
            <p className="text-4xl font-bold inline border-b-4 border-gray-400">
                Info
            </p>
            <p className="py-6">Common eye conditions</p>
            </div>
            <div className="area w-full justify-center items-center grid md:grid-cols-3 gap-8">
              <Tippy content={<span>(AMD) is a form of macular dystrophy. The macular, which is part of the retina at the back of the 
                eye, contains millions of cone cells. These cone cells allow you to see fine detail for things like reading, writing and recognising colours.
                When someone develops AMD, the cone cells become damaged and stop working as they should.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 
              hover:scale-110 duration-500'>Age-related Macular Degeneration (AMD)</button>
              </Tippy>
              <Tippy content={<span>Birdshot Chorioretinopathy is a rare, progressive inflammation of the iris, choroid and cilary body, which together 
              make up a part of the eye known as the uvea. If left undiagnosed or untreated, the condition can cause blindness.</span>}>       
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Birdshot Uveitis</button>
              </Tippy> 
              <Tippy content={<span>Cataracts are a common eye condition in which the lens inside the eye gradually becomes less transparent with age. Over time, a 
                cataract can become worse, making vision cloudier, but it is usually treatable with a straightforward operation</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Cataracts</button>
              </Tippy>
              <Tippy content={<span>Charles Bonnet Syndrome (CBS) is a condition which causes vivid, silent, visual hallucinations. It can develop in a person of any age 
                – children are not exempt – when over 60% of sight is lost. Not everyone who loses sight develops CBS.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Charles Bonnet Syndrome</button>
              </Tippy>
              <Tippy content={<span>Diabetic Retinopathy is a complication of diabetes that damages the tiny blood vessels that deliver blood to the retinas. The condition 
                can cause blindness if left undiagnosed and untreated.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Diabetic Retinopathy</button>
              </Tippy>
              <Tippy content={<span>Glaucoma is the name given to a group of eye conditions that cause sight loss by damaging your optic nerve. Sight loss caused by glaucoma 
                is permanent but there are methods of prevention.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Glaucoma</button>
              </Tippy>
              <Tippy content={<span>Hemianopia can be caused by brain trauma, the most common of which is related to stroke.  The extent of sight loss varies from person to 
                person and depends on the area of the brain that has been affected by the stroke. Around two thirds of people who have a stroke experience some form of vision 
                loss or difficulty in seeing, including Hemianopia.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Hemianopia</button>
              </Tippy>
              <Tippy content={<span>Keratoconus is a progressive eye condition where the normally dome-shaped cornea thins and begins to bulge into a cone-like shape. This 
                distortion deflects light as it enters the eye on the way to the retina, which causes distorted vision.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Keratoconus</button>
              </Tippy>
              <Tippy content={<span>Retinitis Pigmentosa (RP) is the name given to a group of inherited eye conditions called retinal dystrophies. These conditions cause a 
                slow loss of vision, beginning with night vision and peripheral (side) vision and eventually affecting central, colour and reading vision.</span>}>
              <button className='text-xs md:text-base bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md shadow-blue-700 hover:scale-110 
              duration-500'>Retinitis Pigmentosa</button>
              </Tippy>
            </div>
        </div>       
    </div>
  )
}

export default Info