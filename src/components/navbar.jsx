import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

export default function Navbar({ showAuthButtons = true, showProfileIcon = false }) {
  const navRef = useRef(null);
  const brandRef = useRef(null);
  const linksRef = useRef([]);
  const ctasRef = useRef([]);

  useEffect(() => {
    linksRef.current = linksRef.current.filter(Boolean);
    ctasRef.current = ctasRef.current.filter(Boolean);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        brandRef.current,
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, clearProps: "opacity,transform" }
      );

      if (linksRef.current.length) {
        tl.fromTo(
          linksRef.current,
          { y: -14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.08,
            clearProps: "opacity,transform",
          },
          "-=0.2"
        );
      }

      if ((showAuthButtons || showProfileIcon) && ctasRef.current.length) {
        tl.fromTo(
          ctasRef.current,
          { y: -14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.1,
            clearProps: "opacity,transform",
          },
          "-=0.2"
        );
      }
    }, navRef);

    return () => ctx.revert();
  }, [showAuthButtons, showProfileIcon]);

  return (
    <nav className="sticky top-0 z-50 px-4 md:px-8 pt-4">
      <div
        ref={navRef}
        className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl border border-[#d8e7e0] bg-white/90 backdrop-blur-md px-4 md:px-6 py-3 shadow-[0_10px_28px_rgba(24,42,38,0.08)]"
      >
        <h1 ref={brandRef} className="text-2xl font-bold text-[#0f5132]">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 text-white text-sm flex items-center justify-center">
              M
            </span>
            MediShop
          </Link>
        </h1>

        <ul className="hidden md:flex items-center gap-2 rounded-full border border-[#d8e7e0] bg-[#f4fbf7] p-1 text-gray-600 font-medium">
        <li>
          <Link
            to="/"
            ref={(el) => (linksRef.current[0] = el)}
            className="px-4 py-2 rounded-full transition duration-200 hover:bg-white hover:text-[#0f5132] inline-block"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="#about"
            ref={(el) => (linksRef.current[1] = el)}
            className="px-4 py-2 rounded-full transition duration-200 hover:bg-white hover:text-[#0f5132] inline-block"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to="#features"
            ref={(el) => (linksRef.current[2] = el)}
            className="px-4 py-2 rounded-full transition duration-200 hover:bg-white hover:text-[#0f5132] inline-block"
          >
            Features
          </Link>
        </li>
        <li>
          <Link
            to="#contact"
            ref={(el) => (linksRef.current[3] = el)}
            className="px-4 py-2 rounded-full transition duration-200 hover:bg-white hover:text-[#0f5132] inline-block"
          >
            Contact
          </Link>
        </li>
        </ul>

        {showAuthButtons && (
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/login"
              ref={(el) => (ctasRef.current[0] = el)}
              className="px-4 md:px-5 py-2 rounded-xl border border-[#b9d7c6] text-[#0f5132] hover:bg-[#eef8f2] transform transition duration-200 hover:scale-105"
            >
              Login
            </Link>

            <Link
              to="/signup"
              ref={(el) => (ctasRef.current[1] = el)}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 md:px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-600 transform transition duration-200 hover:scale-105 shadow-[0_8px_18px_rgba(16,185,129,0.35)]"
            >
              Sign Up
            </Link>
          </div>
        )}

        {!showAuthButtons && showProfileIcon && (
          <button
            ref={(el) => (ctasRef.current[0] = el)}
            type="button"
            aria-label="Profile"
            className="h-11 w-11 rounded-full border border-[#b9d7c6] bg-[#eef8f2] text-[#0f5132] flex items-center justify-center transition duration-200 hover:bg-[#e4f3eb]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.125a7.5 7.5 0 0115 0" />
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}
