import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Hero() {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const secondaryBtnRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!headingRef.current || !subheadingRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          clearProps: "opacity,transform",
        }
      ).fromTo(
          subheadingRef.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            clearProps: "opacity,transform",
          },
          "-=0.4"
        )
        .fromTo(
          [primaryBtnRef.current, secondaryBtnRef.current],
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            clearProps: "opacity,transform",
          },
          "-=0.25"
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-gradient-to-r from-slate-50 to-green-50">
      <div className="max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-12">

        {/* LEFT CONTENT */}
        <div>
          <h1
            ref={headingRef}
            className="text-5xl font-bold text-gray-900 leading-tight"
          >
            Smart Medicine Resale <br />
            <span className="text-green-600">& Safe Disposal Platform</span>
          </h1>

          <p
            ref={subheadingRef}
            className="mt-6 text-gray-600 text-lg max-w-xl"
          >
            Buy, sell, and safely dispose of medicines with ease. Reduce waste,
            promote reuse, and protect the environment.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              ref={primaryBtnRef}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transform transition duration-200 hover:scale-105"
            >
              Sell Medicines
            </button>
            <button
              ref={secondaryBtnRef}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transform transition duration-200 hover:scale-105"
            >
              Browse Medicines
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center">
          <img
            src="/hero.png"
            alt="MediReuse Hero"
            className="w-full max-w-lg"
          />
        </div>

      </div>
    </section>
  );
}

