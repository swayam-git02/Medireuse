import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import WhyChoose from "../components/WhyChoose";

export default function Landing() {
  return (
    // Landing page me project ke main sections ek flow me show hote hain.
    <div className="bg-[#f7fbff]">
      {/* Top navigation */}
      <Navbar />
      {/* Hero section: first impression + main message */}
      <Hero />
      {/* Features section: app kya-kya karta hai */}
      <Features />
      {/* How it works: user journey simple steps me */}
      <HowItWorks />
      {/* Why choose: trust aur benefits section */}
      <WhyChoose />
    </div>
  );
}
