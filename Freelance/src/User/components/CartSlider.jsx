import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useProductStore from "../../store/ProductSlice";

import cat3 from "../../assets/Retro.jpg";
import cat4 from "../../assets/Accessories.png";
import cat5 from "../../assets/jacket.png";
import cat6 from "../../assets/Track_suit.png";

// ✅ Hardcoded display categories with images
// "value" must EXACTLY match what's stored in DB (lowercase)
const categories = [
  { name: "Retro Jersey", value: "retro jersey", image: cat3 },
  { name: "Accessories",  value: "accessories",  image: cat4 },
  { name: "Jacket",       value: "jacket",        image: cat5 },
  { name: "Track Suit",   value: "track suit",    image: cat6 },
];

const HomeCatGrid = () => {
  const navigate = useNavigate();
  const { setSelectedCategory, fetchProducts, fetchCategories } = useProductStore();

  // Pre-fetch categories on mount so CartPage loads instantly
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (categoryValue) => {
    // ✅ FIX: Set in Zustand store — CartPage reads from store, not route state
    setSelectedCategory(categoryValue);

    // Pre-fetch filtered products so CartPage shows them immediately
    fetchProducts(categoryValue);

    navigate("/cartPage");
  };

  return (
    <div className="w-full px-5 mt-10">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10 text-center">
        Categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 place-items-center">
        {categories.map((category) => (
          <div
            key={category.value}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleCategoryClick(category.value)}
          >
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-full overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="mt-2 text-lg font-semibold text-gray-700">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeCatGrid;