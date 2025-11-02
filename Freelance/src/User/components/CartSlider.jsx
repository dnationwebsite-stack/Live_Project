import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { FreeMode, Pagination } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import cat1 from "../../assets/catsL1.jpg";
import cat2 from "../../assets/catsL2.jpg";
import cat3 from "../../assets/catsL3.jpg";
import cat4 from "../../assets/catsL4.jpg";
import cat5 from "../../assets/catsL5.jpg";
import cat6 from "../../assets/catsL6.jpg";
import cat7 from "../../assets/catsL7.jpg";
import cat8 from "../../assets/catsL8.jpg";

const categories = [
  { name: "Men", image: cat1 },
  { name: "Women", image: cat2 },
  { name: "Kids", image: cat3 },
  { name: "Accessories", image: cat4 },
  { name: "Footwear", image: cat5 },
  { name: "Winter Wear", image: cat6 },
  { name: "Beauty", image: cat7 },
  { name: "Sports", image: cat8 },
];

const HomeCatSlider = () => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const navigate = useNavigate(); // ✅ navigation hook

  const handleSlideChange = () => {
    if (swiperRef.current) {
      setIsBeginning(swiperRef.current.swiper.isBeginning);
      setIsEnd(swiperRef.current.swiper.isEnd);
    }
  };

  // ✅ function to navigate
  const handleCategoryClick = (category) => {
    navigate("/cartPage", { state: { category } }); // optional: pass data to next page
  };

  return (
    <div className="w-full px-5 mt-10 relative">
      {/* 👇 Heading */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Categories
      </h2>

      <div className="relative flex items-center">
        {!isBeginning && (
          <button
            className="absolute left-0 z-10 bg-[#ff5252] text-white cursor-pointer p-2 rounded-full shadow-md"
            onClick={() => swiperRef.current.swiper.slidePrev()}
          >
            <FaChevronLeft />
          </button>
        )}

        <Swiper
          ref={swiperRef}
          slidesPerView={6}
          spaceBetween={20}
          freeMode={true}
          modules={[FreeMode, Pagination]}
          onSlideChange={handleSlideChange}
          onSwiper={(swiper) => {
            swiperRef.current = { swiper };
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index} className="py-2">
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleCategoryClick(category.name)} // 👈 click handler
              >
                {/* 👇 Circular image centered with absolute + transform */}
                <div className="relative w-48 h-48 rounded-full border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute top-3/5 left-1/2 w-full h-full object-cover rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
                <p className="font-medium mt-3 text-gray-800">
                  {category.name}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {!isEnd && (
          <button
            className="absolute right-0 z-10 bg-[#ff5252] text-white cursor-pointer p-2 rounded-full shadow-md"
            onClick={() => swiperRef.current.swiper.slideNext()}
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeCatSlider;
