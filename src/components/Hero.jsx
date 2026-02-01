import React from "react";

export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-slate-50 to-green-50">
      <div className="max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-12">

        {/* LEFT CONTENT */}
        <div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Smart Medicine Resale <br />
            <span className="text-green-600">& Safe Disposal Platform</span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg max-w-xl">
            Buy, sell, and safely dispose of medicines with ease. Reduce waste,
            promote reuse, and protect the environment.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
              Sell Medicines
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
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