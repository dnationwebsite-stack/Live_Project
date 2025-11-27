import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { FreeMode, Pagination } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import cat1 from "../../assets/catsL1.jpg";
import cat2 from "../../assets/catsL2.jpg";
import cat3 from "../../assets/catsL3.jpg";
import cat4 from "../../assets/catsL4.jpg";

const categories = [
  { name: "Men", image: cat1 },
  { name: "Women", image: cat2 },
  { name: "Kids", image: cat3 },
  { name: "Accessories", image: cat4 },
];

const HomeCatSlider = () => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const navigate = useNavigate();

  const handleSlideChange = () => {
    if (swiperRef.current) {
      setIsBeginning(swiperRef.current.swiper.isBeginning);
      setIsEnd(swiperRef.current.swiper.isEnd);
    }
  };

  const handleCategoryClick = (category) => {
    navigate("/cartPage", { state: { category } });
  };

  return (
    <div className="w-full px-5 mt-10 relative">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
        Categoriess
      </h2>

      <div className="relative flex items-center">
        {/* LEFT ARROW (Responsive Size) */}
        {!isBeginning && (
          <button
            className="absolute left-0 z-10 bg-[#ff5252] text-white cursor-pointer 
                       p-2 md:p-3 rounded-full shadow-md"
            onClick={() => swiperRef.current.swiper.slidePrev()}
          >
            <FaChevronLeft size={16} className="md:size-20" />
          </button>
        )}

        <Swiper
          ref={swiperRef}
          freeMode={true}
          modules={[FreeMode, Pagination]}
          onSlideChange={handleSlideChange}
          onSwiper={(swiper) => {
            swiperRef.current = { swiper };
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 2 },     // 📱 Mobile
            480: { slidesPerView: 2 },
            640: { slidesPerView: 3 },   // Tablet
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 4},  // Laptop
            1280: { slidesPerView: 4 },  // Desktop Large
          }}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index} className="py-2">
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="relative 
                                w-32 h-32 
                                sm:w-36 sm:h-36 
                                md:w-44 md:h-44 
                                lg:w-48 lg:h-48 
                                rounded-full border border-gray-200 
                                hover:shadow-lg transition-all duration-300 
                                hover:scale-105 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute top-1/2 left-1/2 w-full h-full object-cover rounded-full 
                              transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <p className="font-medium mt-3 text-gray-800 text-sm md:text-base lg:text-lg">
                  {category.name}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* RIGHT ARROW (Responsive Size) */}
        {!isEnd && (
          <button
            className="absolute right-0 z-10 bg-[#ff5252] text-white cursor-pointer 
                       p-2 md:p-3 rounded-full shadow-md"
            onClick={() => swiperRef.current.swiper.slideNext()}
          >
            <FaChevronRight size={16} className="md:size-20" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeCatSlider;
