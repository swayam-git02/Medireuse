import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import WhyChoose from "./components/WhyChoose";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BrowseMedicine from "./pages/BrowseMedicine";

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <WhyChoose />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const isBrowseMedicineRoute = location.pathname === "/buy-medicine";

  return (
    <>
      {!isAuthRoute && <Navbar disableAnimations={isBrowseMedicineRoute} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/buy-medicine" element={<BrowseMedicine />} />
      </Routes>

      {!isAuthRoute && !isBrowseMedicineRoute && <Footer />}
    </>
  );
}
