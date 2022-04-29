import React from 'react'
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const Contact = () => {
  return (
    <div name="contact" className='w-full h-screen bg-[#9f34b5] text-gray-300 flex justify-center items-center'>
        <div className="max-w-[1000px] mx-auto p-4 flex flex-col justify-center items-center w-full h-full">
            <div>
            <p className="text-4xl font-bold inline border-b-4 border-gray-400">
                Get in Touch
            </p>
            </div>
            <div className="grid grid-cols-4 gap-4 items-center text-center py-8">
                <li className="h-[60px] flex justify-between items-center">
                    <a
                    className="flex justify-between items-center w-full text-gray-300"
                    href="https://www.facebook.com/pollardsopticianswakefield/"
                    target="_blank"
                    rel="noreferrer"
                    >
                    <FaFacebook size={30} />
                    </a>
                </li>
                <li className="h-[60px] flex justify-between items-center">
                    <a
                    className="flex justify-between items-center w-full text-gray-300"
                    href="https://uk.linkedin.com/in/pollards-opticians-66716ba7"
                    target="_blank"
                    rel="noreferrer"
                    >
                    <FaLinkedin size={30} />
                    </a>
                </li>
                <li className="h-[60px] flex justify-between items-center">
                    <a
                    className="flex justify-between items-center w-full text-gray-300"
                    href="https://twitter.com/pollardsopti"
                    target="_blank"
                    rel="noreferrer"
                    >
                    <FaTwitter size={30} />
                    </a>
                </li>
                <li className="h-[60px] flex justify-between items-center">
                    <a
                    className="flex justify-between items-center w-full text-gray-300"
                    href="mailto:info@pollardsopticians.com"
                    target="_blank"
                    rel="noreferrer"
                    >
                    <HiOutlineMail size={30} />
                    </a>
                </li>
                
        </div>

            <div className='text-center items-center'>
            21 Cross Square, Wakefield, WF1 1PQ <br />
            Mon-Sat 9am-5pm <br />
            &copy; {new Date().getFullYear()} Pollards Opticians
            </div>

        </div>
    </div>
  )
}

export default Contact