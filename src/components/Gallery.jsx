import React from 'react'
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import img4 from '../assets/images/4.png'
import img5 from '../assets/images/5.png'
import img6 from '../assets/images/6.png'
import img7 from '../assets/images/7.png'
import img8 from '../assets/images/8.png'
import img9 from '../assets/images/9.png'
import img10 from '../assets/images/10.png'
import img11 from '../assets/images/11.png'
import img12 from '../assets/images/12.png'
import img13 from '../assets/images/13.png'
import img14 from '../assets/images/14.png'
import img15 from '../assets/images/15.png'
import img16 from '../assets/images/16.png'
import img17 from '../assets/images/17.png'
import img18 from '../assets/images/18.png'
import img19 from '../assets/images/19.png'
import img20 from '../assets/images/20.png'
import img21 from '../assets/images/21.png'
import img22 from '../assets/images/22.png'
import img23 from '../assets/images/23.png'
import img24 from '../assets/images/24.png'
import img25 from '../assets/images/25.png'
import img26 from '../assets/images/26.png'
import img27 from '../assets/images/27.png'
import img28 from '../assets/images/28.png'
import img29 from '../assets/images/29.png'
import img30 from '../assets/images/30.png'
import img31 from '../assets/images/31.png'
import img32 from '../assets/images/32.png'
import img33 from '../assets/images/33.png'
import img34 from '../assets/images/34.png'
import img35 from '../assets/images/35.png'
import img36 from '../assets/images/36.png'
import img37 from '../assets/images/37.png'
import img38 from '../assets/images/38.png'


const Gallery = () => {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay(true)])
    
  return (
    <div name="gallery" className="w-full h-screen bg-[#9f34b5] text-gray-300">
        <div className="max-w-[1000px] mx-auto p-4 flex flex-col justify-center w-full h-full">
            <div className="pb-8">
            <p className="text-4xl font-bold inline border-b-4 border-gray-400">
                Gallery
            </p>
            <p className="py-6">Collage of memories</p>
            </div>

            {/* Embla Carousel */}
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                <div className="embla__slide">
                    <img src={ img4 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img5 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img6 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img7 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img8 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img9 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img10 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img11 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img12 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img13 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img14 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img15 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img16 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img17 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img18 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img19 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img20 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img21 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img22 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img23 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img24 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img25 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img26 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img27 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img28 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img29 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img30 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img31 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img32 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img33 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img34 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img35 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img36 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img37 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ img38 } alt='pollards'/>
                </div>
                </div>
            </div>     
        </div>
    </div>
  )
}

export default Gallery