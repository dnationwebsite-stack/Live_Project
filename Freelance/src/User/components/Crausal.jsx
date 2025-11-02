import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Swiper core styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    id: 1,
    title: "Level up your workflow",
    subtitle: "Fast, modern and beautiful UI",
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "Shop the new season",
    subtitle: "Handpicked trends just for you",
    img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    title: "Create. Build. Ship.",
    subtitle: "Everything you need in one place",
    img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1600&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    title: "Summer collection",
    subtitle: "Fresh drops every week",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600&auto=format&fit=crop&q=60",
  },
];

const Slide = ({ item }) => {
  return (
    <div className="relative w-full h-[570px] overflow-hidden">
      <img
        src={item.img}
        alt={item.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      <div className="absolute left-20 bottom-32 text-white">
        <p className="text-sm opacity-90">{item.subtitle}</p>
        <h2 className="text-3xl font-bold">{item.title}</h2>
      </div>
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
