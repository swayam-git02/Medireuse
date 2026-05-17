import BackButton from "../components/BackButton.jsx";
import { Leaf, ShieldCheck, Users, HeartPulse } from "lucide-react";

const highlights = [
  {
    title: "Healthcare Affordability",
    desc: "We help families access quality medicines at fair prices through safe reuse.",
    icon: HeartPulse,
  },
  {
    title: "Safety First",
    desc: "Listings focus on usable stock with clear details and transparent expiry visibility.",
    icon: ShieldCheck,
  },
  {
    title: "Community Impact",
    desc: "Each listing supports a circular healthcare model that benefits both buyers and sellers.",
    icon: Users,
  },
  {
    title: "Eco Responsibility",
    desc: "Proper disposal of expired medicines helps reduce harmful waste in the environment.",
    icon: Leaf,
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
      <div className="mx-auto mb-4 max-w-7xl px-4 md:px-6">
        <BackButton />
      </div>

      <section className="mx-auto max-w-7xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-6 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:p-8">
        <div className="rounded-3xl border border-[#d6ebe4] bg-white/70 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f7f68]">About MediReuse</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1f3d3a] md:text-4xl">
            Building a Safer and Smarter Medicine Cycle
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[#5b7570]">
            MediReuse is a trusted platform where people can list unused medicines, buy affordable options,
            and responsibly dispose expired stock. Our goal is simple: reduce medicine waste, improve access,
            and make healthcare more sustainable for everyone.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-[#dcebe7] bg-white/80 p-5 shadow-[0_8px_18px_rgba(24,64,58,0.08)]"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ddf2ea] text-[#2f7f68]">
                  <Icon size={20} />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-[#223f3a]">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#5b7570]">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
