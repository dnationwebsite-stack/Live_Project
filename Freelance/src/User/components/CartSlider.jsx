import React from "react";
import { useNavigate } from "react-router-dom";

import cat1 from "../../assets/Fan-version.png";
import cat2 from "../../assets/Player-version.png";
import cat3 from "../../assets/Retro.jpg";
import cat4 from "../../assets/Accessories.png";
import cat5 from "../../assets/jacket.png";
import cat6 from "../../assets/Track_suit.png";

const categories = [
  { name: "Fan Version", image: cat1 },
  { name: "Player Version", image: cat2 },
  { name: "Retro Jersey", image: cat3 },
  { name: "Accessories", image: cat4 },
  { name: "Jacket", image: cat5 },
  { name: "Track Suit", image: cat6 },
];

const HomeCatGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate("/cartPage", { state: { category } });
  };

  return (
    <div className="w-full px-5 mt-10">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center">
        Categories
      </h2>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 place-items-center"
      >
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div
              className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-full overflow-hidden"
            >
              <img
                src={category.image}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-700">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeCatGrid;
