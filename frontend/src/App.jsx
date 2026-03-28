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
  const isLoggedIn = authAPI.isAuthenticated();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const isBrowseMedicineRoute = location.pathname === "/buy-medicine";
  const isOrderHistoryRoute = location.pathname === "/orders";
  const isSellMedicineRoute = location.pathname === "/sell-medicine" || location.pathname === "/my-listings";
  const isAdminRoute = location.pathname === "/admin";
  const isProfileRoute = location.pathname === "/profile";

  return (
    <>
      {!isAuthRoute && (
        <Navbar
          showAuthButtons={!isLoggedIn}
          showProfileIcon={isLoggedIn}
          disableAnimations={isBrowseMedicineRoute || isOrderHistoryRoute || isSellMedicineRoute || isProfileRoute}
        />
      )}

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
      </Routes>

      {/* hide footer on auth, buy/sell medicine, orders, and admin pages */}
      {!isAuthRoute && !isBrowseMedicineRoute && !isOrderHistoryRoute && !isSellMedicineRoute && !isAdminRoute && !isProfileRoute && <Footer />}
    </>
  );
}
