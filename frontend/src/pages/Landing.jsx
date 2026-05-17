import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import WhyChoose from "../components/WhyChoose";
import BackButton from "../components/BackButton.jsx";

export default function Landing() {
  // Landing page ek composition page hai: yeh khud data logic nahi chalata, sirf sections ko arrange karta hai.
  return (
    // Landing page me project ke main sections ek flow me show hote hain.
    <div className="bg-[#f7fbff]">
      {/* Top navigation */}
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
        <BackButton />
      </div>
      {/* Hero section: first impression + main message */}
      <Hero />
      {/* Features section: app kya-kya karta hai */}
      <Features />
      {/* How it works: user journey simple steps me */}
      <HowItWorks />
      {/* Why choose: trust aur benefits section */}
      <WhyChoose />
      {/* Note: transition/animation mostly in child components me define hai, is wrapper page me direct animation class nahi hai. */}
    </div>
  );
}
