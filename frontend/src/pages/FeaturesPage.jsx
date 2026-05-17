import BackButton from "../components/BackButton.jsx";
import Features from "../components/Features.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import WhyChoose from "../components/WhyChoose.jsx";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#f3faf7]">
      <section className="px-4 pt-4 md:px-8">
        <div className="mx-auto mb-4 max-w-7xl px-4 md:px-6">
          <BackButton />
        </div>

        <div className="mx-auto max-w-7xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 px-6 py-7 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f7f68]">Platform Features</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f3d3a] md:text-4xl">
            Everything You Need to Reuse and Dispose Medicines Safely
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#5b7570] md:text-base">
            Explore the complete MediReuse workflow from listing and verification to buying, tracking, and safe disposal.
          </p>
        </div>
      </section>

      <Features />
      <HowItWorks />
      <WhyChoose />
    </main>
  );
}
