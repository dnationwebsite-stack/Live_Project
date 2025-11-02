import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// Dummy categories data
const categories = [
  {
    name: "Jersey",
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `jersey-${i + 1}`,
      name: `Jersey ${i + 1}`,
      image: `https://via.placeholder.com/200x200.png?text=Jersey+${i + 1}`,
    })),
  },
  {
    name: "Boot",
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `boot-${i + 1}`,
      name: `Boot ${i + 1}`,
      image: `https://via.placeholder.com/200x200.png?text=Boot+${i + 1}`,
    })),
  },
];

// ✅ Total count
const totalItems = categories.reduce(
  (acc, category) => acc + category.items.length,
  0
);

console.log("Total Items:", totalItems); // 8


// Random shuffle helper
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const CategorySlider = () => {
  // Combine + shuffle all items
  const allItems = shuffleArray([
    ...categories[0].items,
    ...categories[1].items,
  ]);

  return (
    <div className="w-full px-8 py-10">
      <h2 className="text-3xl text-center font-bold mb-6">Categories</h2>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={6} // show 6 items
        navigation
        className="w-full"
      >
        {allItems.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="bg-white shadow-md rounded-xl p-4 transition-transform duration-300 hover:scale-105 cursor-pointer">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-400 object-cover rounded-lg"
              />
              <p className="text-center mt-3 font-semibold">{item.name}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategorySlider;
