import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import { gsap } from "gsap";
import BuyNowModal from "../components/BuyNowModal.jsx";

// Yeh category list dropdown me dikhayi jaati hai.
const categories = [
  { label: "Tablets", count: 120 },
  { label: "Syrups", count: 53 },
  { label: "Capsules", count: 68 },
  { label: "Supplements", count: 42 },
];

// Yeh sample medicine data hai jo cards me render hota hai.
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
  // In refs ka use animation ke liye hota hai, taaki hum exact section ko animate kar sakein.
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const paginationRef = useRef(null);

  // User ne kaunsa filter select kiya, wo yaha store hota hai.
  const [selectedCategory, setSelectedCategory] = useState(null);
  // 'asc' = jaldi expiry pehle, 'desc' = late expiry pehle.
  const [sortOrder, setSortOrder] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Yeh main function hai jo data ko filter + search + sort karke final list return karta hai.
  const getFilteredMedicines = () => {
    // Start me saari medicines lete hain.
    let filtered = medicines;

    // Agar category select hui hai to us type ki medicines hi rakhenge.
    if (selectedCategory) {
      // UI category ko actual data type se map kar rahe hain.
      const typeMap = {
        Tablets: 'Tablet',
        Syrups: 'Syrup',
        Capsules: 'Capsule',
        Supplements: 'Verified'
      };
      const targetType = typeMap[selectedCategory];
      filtered = filtered.filter(m => m.type === targetType);
    }

    // Search box me jo text user likhega uske hisab se naam match karke filter karenge.
    if (searchQuery.trim()) {
      filtered = filtered.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Expiry date ke hisab se sorting (ascending ya descending) karte hain.
    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.expiry);
        const dateB = new Date(b.expiry);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    return filtered;
  };

  const filteredMedicines = getFilteredMedicines();

  // Yeh function dropdown ke bahar click hote hi dropdown close kar deta hai.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown') && !event.target.closest('.sort-dropdown')) {
        setIsDropdownOpen(false);
        setIsSortDropdownOpen(false);
      }
    };
    if (isDropdownOpen || isSortDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen, isSortDropdownOpen]);

  // Yeh GSAP animation wala part hai: page load pe header, cards aur pagination smooth entry lete hain.
  useLayoutEffect(() => {
    cardsRef.current = cardsRef.current.filter(Boolean);

    const ctx = gsap.context(() => {
      // Agar user device me reduced motion setting on hai, to animation skip kar dete hain.
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      // Timeline ka matlab: ek ke baad ek animation sequence me chalana.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1) Header fade + slide in.
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.55, clearProps: "opacity,transform" }
      )
        // 2) Cards fade + slide in with stagger (ek-ek karke).
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
        // 3) Pagination last me softly appear hota hai.
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

            <div className="mt-5 grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto]">
              {/* Search input: yaha user medicine ka naam likh kar list filter karta hai */}
              <label className="flex items-center gap-3 rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-[#5b7570]">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search medicine by name..."
                  value={searchQuery}
                  // onChange function har typing pe state update karta hai.
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm md:text-base outline-none placeholder:text-[#8aa39c]"
                />
              </label>

              {/* Category dropdown: yaha category choose karte hi list filter ho jaati hai */}
              <div className="relative dropdown">
                <button
                  type="button"
                  // onClick function dropdown open/close karta hai.
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm md:text-base text-[#3d5f57] w-full"
                >
                  {selectedCategory || 'All Categories'}
                  {/* transition-transform = arrow icon rotate smooth way me hota hai */}
                  <ChevronDown size={17} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-[#d3e7e0] bg-white shadow-lg z-10">
                    <button
                      type="button"
                      // Is function se category reset ho kar "All Categories" pe aati hai.
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm md:text-base text-[#3d5f57] hover:bg-[#ecf7f3] first:rounded-t-xl"
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.label}
                        type="button"
                        // Category select karte hi list usi hisab se filter ho jaati hai.
                        onClick={() => {
                          setSelectedCategory(category.label);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm md:text-base text-[#3d5f57] hover:bg-[#ecf7f3] last:rounded-b-xl"
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort dropdown: yaha expiry date ke hisab se order change hota hai */}
              <div className="relative sort-dropdown">
                <button
                  type="button"
                  // onClick function sort dropdown open/close karta hai.
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center justify-between rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm md:text-base text-[#3d5f57] w-full"
                >
                  {sortOrder === 'asc' ? 'Earliest First' : sortOrder === 'desc' ? 'Latest First' : 'Sort by Expiry Date'}
                  {/* transition-transform = arrow rotate animation */}
                  <ChevronDown size={17} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-[#d3e7e0] bg-white shadow-lg z-10">
                    <button
                      type="button"
                      // Is function se sorting remove (None) ho jaati hai.
                      onClick={() => {
                        setSortOrder(null);
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm md:text-base text-[#3d5f57] hover:bg-[#ecf7f3] first:rounded-t-xl"
                    >
                      None
                    </button>
                    <button
                      type="button"
                      // Ascending: sabse jaldi expiry wali medicine pehle.
                      onClick={() => {
                        setSortOrder('asc');
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm md:text-base text-[#3d5f57] hover:bg-[#ecf7f3]"
                    >
                      Earliest First
                    </button>
                    <button
                      type="button"
                      // Descending: sabse baad expiry wali medicine pehle.
                      onClick={() => {
                        setSortOrder('desc');
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm md:text-base text-[#3d5f57] hover:bg-[#ecf7f3] last:rounded-b-xl"
                    >
                      Latest First
                    </button>
                  </div>
                )}
              </div>

              {/* Clear All: saare filters aur search ko ek click me reset karta hai */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSortOrder(null);
                  setSearchQuery('');
                }}
                // transition = button color smooth way me change hota hai hover pe.
                className="rounded-xl bg-[#37aa82] px-4 py-3 text-sm md:text-base font-medium text-white hover:bg-[#2e9d79] transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Right side image sirf visual support ke liye hai */}
          <img
            src="/buy medicine.png"
            alt="Medicine display"
            className="mx-auto w-full max-w-[220px] rounded-2xl object-cover md:max-w-[245px]"
          />
        </div>

        <section className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map((item, index) => (
              <article
                key={item.name}
                // Har card ka ref GSAP animation ko target dene ke liye store hota hai.
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
                      // Buy button pe click karte hi selected medicine set hoti hai aur modal open hota hai.
                      onClick={() => {
                        setSelectedMedicine(item);
                        setIsModalOpen(true);
                      }}
                      // transition-opacity = hover pe halka transparency change smooth lagta hai.
                      className="rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-5 py-2.5 text-lg font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </article>
            ))
            ) : (
              // Agar filter ke baad koi medicine nahi milti to yeh message show hota hai.
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-[#5b7570]">No medicines found matching your criteria.</p>
                <p className="text-sm text-[#8aa39c] mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pagination area ka bhi GSAP load animation hota hai (upar useLayoutEffect me). */}
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

      {/* Buy Now Modal */}
      <BuyNowModal
        medicine={selectedMedicine}
        isOpen={isModalOpen}
        // onClose function modal band karta hai aur selected medicine clear karta hai.
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMedicine(null);
        }}
        // onOrderSuccess function order successful hone ke baad run hota hai.
        onOrderSuccess={() => {
          // Optional: refresh medicines list or show success message
          console.log('Order placed successfully!');
        }}
      />
    </main>
  );
}
