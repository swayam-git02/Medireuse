import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const features = [
  {
    title: "Submit Medicines",
    desc: "Submit unused, non-expired medicines for resale or expired medicines for safe disposal.",
    icon: "/submit.png",
  },
  {
    title: "Buy Affordable Medicines",
    desc: "Our team verifies the details and approve listing.",
    icon: "/buy medicine.png",
  },
  {
    title: "Dispose Expired Medicines",
    desc: "Non-expired medicines are listed for sale. Expired medicines are scheduled for safe disposal.",
    icon: "/hazard.png",
  },
  {
    title: "Track & Verify",
    desc: "Get paid for your non-expired medicines after a successful sale.",
    icon: "/track and verify.png",
  },
];

export default function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".feature-card", sectionRef.current);
      const icons = gsap.utils.toArray(".feature-icon", sectionRef.current);
      if (!cards.length) return;

      gsap.set(cards, { y: 42, opacity: 0 });
      gsap.set(icons, { scale: 0.75, opacity: 0 });

      cards.forEach((card, i) => {
        const icon = icons[i];
        const delay = i * 0.08;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          delay,
          defaults: { ease: "power3.out" },
        });

        tl.to(card, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          clearProps: "opacity,transform",
        });

        if (icon) {
          tl.to(
            icon,
            {
              scale: 1,
              opacity: 1,
              duration: 0.35,
              clearProps: "opacity,transform",
            },
            "-=0.3"
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-14 bg-[#eef7fb] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/features_bg.png')" }}
    >
      <div className="pointer-events-none absolute -top-28 -left-20 w-96 h-96 rounded-full bg-[#c6def0]/50 blur-2xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 w-72 h-72 rounded-full bg-[#d5ebf5]/50 blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {features.map((item, i) => (
          <div
            key={i}
            className="feature-card group bg-white rounded-2xl border border-[#dbe8f2] p-5 md:p-6 shadow-[0_6px_16px_rgba(15,40,70,0.06)] hover:shadow-[0_10px_24px_rgba(15,40,70,0.12)] hover:-translate-y-2 transition duration-300"
          >
            <div
              className="feature-icon w-24 h-24 mx-auto flex items-center justify-center transition duration-300 group-hover:scale-110"
            >
              <img
                src={item.icon}
                alt={item.title}
                className="w-24 h-24 object-contain"
              />
            </div>

            <h3 className="mt-4 text-center font-semibold text-[18px] leading-[1.25] text-[#1f2937]">
              {item.title}
            </h3>
            <p className="mt-3 text-center text-[14px] leading-[1.5] text-[#4b5563]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
