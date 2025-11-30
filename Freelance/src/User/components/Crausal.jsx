import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import slide1 from "../../assets/slide1.png"
import slide2 from "../../assets/slide2.png"
import slide3 from "../../assets/slide3.png"

// Swiper core styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    id: 1,
    title: "Level up your workflow",
    subtitle: "Fast, modern and beautiful UI",
    img: slide1,
  },
  {
    id: 2,
    title: "Shop the new season",
    subtitle: "Handpicked trends just for you",
    img: slide2,
  },
  {
    id: 3,
    title: "Create. Build. Ship.",
    subtitle: "Everything you need in one place",
    img: slide3,
  },
];
const Slide = ({ item }) => {
  return (
    <div className="relative w-full h-[570px] overflow-hidden flex items-center justify-center">
      <img
        src={item.img}
        alt={item.title}
        className="w-full  object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
    </div>
  );
};


export default function Crausal() {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      loop
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      style={{ width: "100%", height: "470px" }}
    >
      {slides.map((s) => (
        <SwiperSlide key={s.id}>
          <Slide item={s} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
