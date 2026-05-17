import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import WhyChoose from "./components/WhyChoose";
import Footer from "./components/Footer";
import authAPI from "./services/api";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BrowseMedicine from "./pages/BrowseMedicine";
import OrderHistory from "./pages/OrderHistory";
import SellMedicine from "./pages/SellMedicine";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import About from "./pages/About";
import FeaturesPage from "./pages/FeaturesPage";
import ContactUs from "./pages/ContactUs";

function Home() {
  // Home screen par yeh section components sequence me render hote hain.
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
  // useLocation se current URL path milta hai.
  const location = useLocation();
  // Token ke basis par login status check karte hain.
  const isLoggedIn = authAPI.isAuthenticated();

  // Har route ke liye boolean flags, taaki Navbar/Footer visibility control ho sake.
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const isBrowseMedicineRoute = location.pathname === "/buy-medicine";
  const isOrderHistoryRoute = location.pathname === "/orders";
  const isSellMedicineRoute = location.pathname === "/sell-medicine" || location.pathname === "/my-listings";
  const isAdminRoute = location.pathname === "/admin";
  const isProfileRoute = location.pathname === "/profile";

  return (
    <>
      {/* Auth page par Navbar hide, baaki pages par show. */}
      {!isAuthRoute && (
        <Navbar
          // Login hone par Login/Signup hide, profile option show.
          showAuthButtons={!isLoggedIn}
          showProfileIcon={isLoggedIn}
          // Kuch pages par heavy hover transform disable karne ke liye flag.
          disableAnimations={isBrowseMedicineRoute || isOrderHistoryRoute || isSellMedicineRoute || isProfileRoute}
        />
      )}

      {/* Route mapping: URL path ke hisab se kaunsa page render hoga */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/buy-medicine" element={<BrowseMedicine />} />
        <Route path="/sell-medicine" element={<SellMedicine />} />
        <Route path="/my-listings" element={<SellMedicine />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>

      {/* Footer ko selected pages par hide kiya gaya hai for clean layout */}
      {!isAuthRoute && !isBrowseMedicineRoute && !isOrderHistoryRoute && !isSellMedicineRoute && !isAdminRoute && !isProfileRoute && <Footer />}
    </>
  );
}
