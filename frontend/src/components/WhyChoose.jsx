import { useEffect, useRef } from "react";
import { Recycle, IndianRupee, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const items = [
  {
    title: "Reduce Medicine Waste",
    desc: "Minimize waste by reselling non expired medicines and disposing expired ones safely.",
    icon: Recycle,
    iconWrap: "bg-gradient-to-br from-[#7ee2a5] to-[#4ccf7f]",
  },
  {
    title: "Affordable Healthcare",
    desc: "Buy medicines at lower prices, making healthcare affordable for everyone.",
    icon: IndianRupee,
    iconWrap: "bg-gradient-to-br from-[#ffd35f] to-[#f2b52d]",
  },
  {
    title: "Eco-Friendly Disposal",
    desc: "Ensure safe and eco-friendly disposal of expired medicines, protecting our environment.",
    icon: ShieldCheck,
    iconWrap: "bg-gradient-to-br from-[#4fa6ef] to-[#2d7ed9]",
  },
];

export default function WhyChoose() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".why-card", sectionRef.current);
      const badges = gsap.utils.toArray(".why-badge", sectionRef.current);

      if (!cards.length) return;

      gsap.set(cards, { y: 26, opacity: 0 });
      gsap.set(badges, { scale: 0.85, opacity: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
            once: true,
          },
          defaults: { ease: "power3.out" },
        })
        .to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.12,
          clearProps: "opacity,transform",
        })
        .to(
          badges,
          {
            scale: 1,
            opacity: 1,
            duration: 0.35,
            stagger: 0.12,
            clearProps: "opacity,transform",
          },
          "-=0.45"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#f7fafc] py-20 overflow-hidden">
      <div className="pointer-events-none absolute -top-28 -left-24 w-[440px] h-[440px] rounded-full bg-[#d6edf0]" />
      <div className="pointer-events-none absolute bottom-0 -right-14 w-40 h-40 rounded-full bg-[#d6f1eb]" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-8">
        <h2 className="text-center text-5xl md:text-[52px] font-bold text-[#2b3242] tracking-[-0.01em]">
          Why Choose MediReuse?
        </h2>

        <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="why-card bg-white border border-[#e4eaf2] rounded-2xl p-6 shadow-[0_6px_16px_rgba(18,34,56,0.08)] hover:-translate-y-2 hover:shadow-[0_12px_26px_rgba(18,34,56,0.14)] transition duration-300"
              >
                <div
                  className={`why-badge w-14 h-14 rounded-full flex items-center justify-center text-white ${item.iconWrap}`}
                >
                  <Icon size={28} />
                </div>

                <h3 className="mt-5 text-2xl leading-tight font-semibold text-[#2b3242]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[17px] leading-relaxed text-[#4f596a]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
