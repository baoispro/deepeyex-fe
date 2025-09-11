"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/app/shares/locales/navigation";

const slides = [
  {
    bg: "https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/banner-1.jpg",
    title: "DeepEyeX",
    subtitle: "Eye Care & Holistic Health Center",
    text: "We solve all your eye care needs by providing personalized and holistic eye care for you and your family!",
    button: "Contact Now",
    buttonLink: "https://23july.hostlin.com/optcare/contact/",
  },
  {
    bg: "https://23july.hostlin.com/optcare/wp-content/uploads/2022/05/banner-2.jpg",
    title: "DeepEyeX",
    subtitle: "Eye Care & Holistic Health Center",
    text: "We solve all your eye care needs by providing personalized and holistic eye care for you and your family!",
    button: "Contact Now",
    buttonLink: "https://23july.hostlin.com/optcare/contact/",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{
            backgroundImage: `url(${slide.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-6 md:px-12 text-white">
            <AnimatePresence mode="wait">
              {index === current && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1 }}
                >
                  <h1 className="text-5xl md:text-6xl font-extrabold mb-4">{slide.title}</h1>
                  <h2 className="text-2xl md:text-3xl font-semibold mb-4">{slide.subtitle}</h2>
                  <p className="max-w-xl mb-6">{slide.text}</p>
                  <Link
                    href={slide.buttonLink}
                    className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition"
                  >
                    {slide.button}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition"
      >
        &#8592;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition"
      >
        &#8594;
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 w-full flex justify-center space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${idx === current ? "bg-white" : "bg-gray-400"}`}
          />
        ))}
      </div>
    </section>
  );
}
