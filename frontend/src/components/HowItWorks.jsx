import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  {
    step: "1",
    title: "List Your Medicines",
    desc: "Submit unused, non-expired medicines for resale or expired medicines for safe disposal.",
    color: "bg-[#4cc38a]",
  },
  {
    step: "2",
    title: "Get Verified",
    desc: "Our team verifies the details and approve listing.",
    color: "bg-[#3f96de]",
  },
  {
    step: "3",
    title: "Sell or Dispose",
    desc: "Non-expired medicines are listed for sale. Expired medicines are scheduled for safe disposal.",
    color: "bg-[#ef5b5e]",
  },
  {
    step: "4",
    title: "Receive Payment",
    desc: "Get paid for your non-expired medicines after a successful sale.",
    color: "bg-[#f2b53a]",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const stepCards = gsap.utils.toArray(".how-step");
      const desktopBadges = gsap.utils.toArray(".how-badge-desktop");
      const mobileBadges = gsap.utils.toArray(".how-badge-mobile");

      gsap.set(progressRef.current, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(stepCards, { y: 18, opacity: 0 });
      gsap.set(desktopBadges, { scale: 0.85, opacity: 0 });
      gsap.set(mobileBadges, { scale: 0.85, opacity: 0 });

      const progressDuration = 2.6;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      tl.to(progressRef.current, {
        scaleX: 1,
        duration: progressDuration,
        ease: "power1.inOut",
      });

      stepCards.forEach((card, i) => {
        const at = (i / stepCards.length) * progressDuration + 0.1;

        tl.to(
          [desktopBadges[i], mobileBadges[i]],
          {
            scale: 1,
            opacity: 1,
            duration: 0.28,
            clearProps: "opacity,transform",
          },
          at
        ).to(
          card,
          {
            y: 0,
            opacity: 1,
            duration: 0.38,
            clearProps: "opacity,transform",
          },
          at + 0.03
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-4xl leading-tight font-bold text-[#1f2937]">
          How It Works
        </h2>
        <p className="text-[#4b5563] mt-2 text-lg">
          Simple steps to resell or dispose your medicines safely
        </p>

        <div className="mt-10 bg-white rounded-[22px] border border-[#e5ebf3] shadow-[0_8px_24px_rgba(24,48,82,0.08)] px-5 md:px-7 pb-6 md:pb-7 pt-10">
          <div className="relative hidden md:block">
            <div className="absolute left-8 right-8 top-5 h-[8px] bg-[#eaf1f7] rounded-full" />
            <div
              ref={progressRef}
              className="absolute left-8 right-8 top-5 h-[8px] bg-gradient-to-r from-[#78d8b2] via-[#a5c9f0] via-[#f4b9bf] to-[#f5d27e] rounded-full"
            />
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {steps.map((s, i) => (
                <div key={i} className="flex justify-center">
                  <div
                    className={`how-badge how-badge-desktop w-14 h-14 rounded-full text-white text-3xl font-semibold flex items-center justify-center ${s.color}`}
                  >
                    {s.step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-5 mt-2 md:mt-5 text-left">
            {steps.map((s, i) => (
              <div key={i} className="how-step">
                <div className="md:hidden mb-3">
                  <div
                    className={`how-badge how-badge-mobile w-11 h-11 rounded-full text-white text-xl font-semibold flex items-center justify-center ${s.color}`}
                  >
                    {s.step}
                  </div>
                </div>
                <h3 className="text-2xl leading-tight font-semibold text-[#1f2937]">
                  {s.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-[#4b5563]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
