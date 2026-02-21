import { useLayoutEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import { gsap } from "gsap";

const categories = [
  { label: "Tablets", count: 120 },
  { label: "Syrups", count: 53 },
  { label: "Capsules", count: 68 },
  { label: "Supplements", count: 42 },
];

const medicines = [
  { name: "Paracetamol", type: "Tablet", expiry: "2025-08-12", price: 120, qty: 20, verified: false },
  { name: "Amoxicilin 250mg", type: "Capsule", expiry: "2024-11-20", price: 80, qty: 15, verified: false },
  { name: "Vitamin C 500mg", type: "Verified", expiry: "2025-06-30", price: 200, qty: 25, verified: true },
  { name: "Pantoprazole 40mg", type: "Tablet", expiry: "2024-10-15", price: 100, qty: 10, verified: false },
  { name: "Cough Syrup", type: "Syrup", expiry: "2025-01-05", price: 80, qty: 8, verified: false },
  { name: "Metformin 500mg", type: "Verified", expiry: "2026-03-10", price: 70, qty: 30, verified: true },
  { name: "Dolo 650", type: "Tablet", expiry: "2025-12-10", price: 90, qty: 18, verified: false },
  { name: "Cetirizine", type: "Tablet", expiry: "2025-09-01", price: 65, qty: 22, verified: false },
  { name: "Multivitamins", type: "Capsule", expiry: "2026-02-21", price: 130, qty: 12, verified: false },
];

export default function BrowseMedicine() {
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const sidebarItemsRef = useRef([]);
  const clearFilterRef = useRef(null);
  const cardsRef = useRef([]);
  const paginationRef = useRef(null);

  useLayoutEffect(() => {
    sidebarItemsRef.current = sidebarItemsRef.current.filter(Boolean);
    cardsRef.current = cardsRef.current.filter(Boolean);

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.55, clearProps: "opacity,transform" }
      )
        .fromTo(
          sidebarRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.5, clearProps: "opacity,transform" },
          "-=0.2"
        )
        .fromTo(
          sidebarItemsRef.current,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.32,
            stagger: 0.08,
            clearProps: "opacity,transform",
          },
          "-=0.15"
        )
        .fromTo(
          clearFilterRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, clearProps: "opacity,transform" },
          "-=0.1"
        )
        .fromTo(
          cardsRef.current,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.08,
            clearProps: "opacity,transform",
          },
          "-=0.25"
        )
        .fromTo(
          paginationRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.35, clearProps: "opacity,transform" },
          "-=0.18"
        );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
      <section className="mx-auto max-w-7xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-6 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:p-8">
        <div ref={headerRef} className="grid gap-5 rounded-3xl border border-[#d6ebe4] bg-white/70 p-5 md:grid-cols-[1.45fr_auto] md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#1f3d3a] md:text-3xl">Browse Medicines</h1>
            <p className="mt-2 text-sm text-[#5b7570] md:text-base">
              Find and purchase unused medicine safely and affordably.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]">
              <label className="flex items-center gap-3 rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-[#5b7570]">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search medicine by name..."
                  className="w-full bg-transparent text-sm md:text-base outline-none placeholder:text-[#8aa39c]"
                />
              </label>

              <button
                type="button"
                className="flex items-center justify-between rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm md:text-base text-[#3d5f57]"
              >
                All Categories
                <ChevronDown size={17} />
              </button>

              <button
                type="button"
                className="flex items-center justify-between rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm md:text-base text-[#3d5f57]"
              >
                Sort by Expiry Date
                <ChevronDown size={17} />
              </button>
            </div>
          </div>

          <img
            src="/buy medicine.png"
            alt="Medicine display"
            className="mx-auto w-full max-w-[220px] rounded-2xl object-cover md:max-w-[245px]"
          />
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[230px_1fr]">
          <aside ref={sidebarRef} className="rounded-2xl border border-[#d6ebe4] bg-white/70 p-5">
            <h2 className="text-xl font-medium text-[#2e4c46]">Filter by Category</h2>
            <ul className="mt-6 space-y-4 text-[#4f6b65]">
              {categories.map((category, index) => (
                <li
                  key={category.label}
                  ref={(el) => {
                    sidebarItemsRef.current[index] = el;
                  }}
                  className="flex items-center justify-between text-base"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#edf7f3] text-[#57a48e]">
                      <Package size={14} />
                    </span>
                    {category.label}
                  </span>
                  <span>{category.count}</span>
                </li>
              ))}
            </ul>

            <button
              ref={clearFilterRef}
              type="button"
              className="mt-8 text-base text-[#68857e] transition hover:text-[#2f6e5f]"
            >
              Clear Filters
            </button>
          </aside>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {medicines.map((item, index) => (
              <article
                key={item.name}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="rounded-2xl border border-[#dcebe7] bg-white/80 p-4 shadow-[0_8px_18px_rgba(24,64,58,0.08)]"
              >
                <img
                  src="/buy medicine.png"
                  alt={item.name}
                  className="h-40 w-full rounded-xl border border-[#d7e9e3] object-cover"
                />
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-medium text-[#223f3a]">{item.name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        item.verified ? "bg-[#dff5eb] text-[#2b8f72]" : "bg-[#edf7f3] text-[#5e8d80]"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-2 text-base text-[#6b8781]">Expir: {item.expiry}</p>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl leading-none text-[#1f3f39]">Rs {item.price}</p>
                      <p className="mt-1 text-sm text-[#6a847f]">In Stock &nbsp; {item.qty}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-5 py-2.5 text-lg font-medium text-white"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div ref={paginationRef} className="mt-6 inline-flex overflow-hidden rounded-xl border border-[#d3e8e1] bg-white/80">
          <button type="button" className="px-4 py-3 text-[#597a72] hover:bg-[#ecf7f3]">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="border-x border-[#d3e8e1] px-4 py-3 text-[#2f6c5f]">
            1
          </button>
          <button type="button" className="border-r border-[#d3e8e1] px-4 py-3 text-[#597a72] hover:bg-[#ecf7f3]">
            2
          </button>
          <button type="button" className="px-4 py-3 text-[#597a72] hover:bg-[#ecf7f3]">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </main>
  );
}