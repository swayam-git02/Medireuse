import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import WhyChoose from "../components/WhyChoose";

export default function Landing() {
  return (
    <div className="bg-[#f7fbff]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhyChoose />
    </div>
  );
}
