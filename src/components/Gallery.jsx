import React from 'react'
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { images } from '../constants/'


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
                    <img src={ images.img4 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img5 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img6 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img7 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img8 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img9 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img10 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img11 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img12 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img13 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img14 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img15 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img16 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img17 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img18 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img19 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img20 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img21 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img22 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img23 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img24 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img25 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img26 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img27 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img28 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img29 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img30 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img31 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img32 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img33 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img34 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img35 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img36 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img37 } alt='pollards'/>
                </div>
                <div className="embla__slide">
                    <img src={ images.img38 } alt='pollards'/>
                </div>
                </div>
            </div>     
        </div>
    </div>
  )
}

export default Gallery