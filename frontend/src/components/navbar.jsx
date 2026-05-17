import { Link, useLocation } from "react-router-dom";
import authAPI from "../services/api";

export default function Navbar({
  // In props se control hota hai ki auth buttons/profile icon show hoga ya nahi.
  showAuthButtons = true,
  showProfileIcon = false,
  mode = "default",
  disableAnimations = false,
}) {
  // Current active route path nikalne ke liye useLocation.
  const location = useLocation();

  // Local storage me save user details read karte hain.
  const user = authAPI.getStoredUser();
  const isAdmin = user?.role === 'admin';
  // Name se profile initials ban rahe hain (example: Adarsh Kumar -> AK).
  const profileInitials = user?.name
    ?.split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

  // Dashboard mode me dikhne wale navigation links.
  const dashboardLinks = [
    { label: "Dashboard", path: "/" },
    { label: "Buy Medicine", path: "/buy-medicine" },
    { label: "Track & Verify", path: "/track-verify" },
    { label: "My Listings", path: "/my-listings" },
  ];

  if (isAdmin) {
    // Admin user ko extra Admin page link milta hai.
    dashboardLinks.push({ label: 'Admin', path: '/admin' });
  }

  const defaultLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Features", path: "/features" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 px-4 md:px-8 pt-4">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between border border-[#d8e7e0] px-4 md:px-6 py-3 ${
          mode === "dashboard"
            ? "rounded-3xl bg-[#f5fbf9]/95 backdrop-blur-sm shadow-none"
            : "rounded-2xl bg-white/90 backdrop-blur-md shadow-[0_10px_28px_rgba(24,42,38,0.08)]"
        }`}
      >
        <h1 className="text-2xl font-bold text-[#0f5132]">
          <Link to="/" className="flex items-center gap-2">
            {mode === "dashboard" ? (
              <span className="relative h-10 w-10 rounded-full bg-[conic-gradient(from_180deg,#59cc6a_0_45%,#56b8f2_45%_100%)]">
                <span className="absolute inset-[7px] rounded-full bg-[#f5fbf9]" />
              </span>
            ) : (
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 text-white text-sm flex items-center justify-center">
                M
              </span>
            )}
            {mode === "dashboard" ? "MediReuse" : "MediShop"}
          </Link>
        </h1>

        {mode === "dashboard" ? (
          <ul className="hidden lg:flex items-center gap-10 text-[15px] text-[#526770] font-medium">
            {dashboardLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    // transition-colors = hover/active pe text color smooth change hota hai.
                    className={`relative pb-3 transition-colors ${
                      isActive ? "text-[#2d9d7f]" : "hover:text-[#2d9d7f]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full bg-[#2d9d7f]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="hidden md:flex items-center gap-2 rounded-full border border-[#d8e7e0] bg-[#f4fbf7] p-1 text-gray-600 font-medium">
            {defaultLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    // transition = hover/active pe background-color smooth badalta hai.
                    className={`inline-block rounded-full px-4 py-2 transition duration-200 ${
                      isActive ? "bg-white text-[#0f5132]" : "hover:bg-white hover:text-[#0f5132]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {showAuthButtons && (
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/login"
              // transition + hover:scale-105 se button hover pe smooth zoom feel deta hai.
              className={`px-4 md:px-5 py-2 rounded-xl border border-[#b9d7c6] text-[#0f5132] hover:bg-[#eef8f2] ${
                disableAnimations ? "" : "transform transition duration-200 hover:scale-105"
              }`}
            >
              Login
            </Link>

            <Link
              to="/signup"
              // transition + hover:scale-105 = signup button ka smooth hover animation.
              className={`bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 md:px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-600 shadow-[0_8px_18px_rgba(16,185,129,0.35)] ${
                disableAnimations ? "" : "transform transition duration-200 hover:scale-105"
              }`}
            >
              Sign Up
            </Link>
          </div>
        )}

        {!showAuthButtons && showProfileIcon && (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              aria-label="Profile"
              // transition-colors = profile icon hover pe color/background smooth badalta hai.
              className="h-11 w-11 rounded-full border border-[#b9d7c6] bg-[#eef8f2] text-[#0f5132] flex items-center justify-center transition-colors hover:bg-[#e2f2ea]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.125a7.5 7.5 0 0115 0" />
              </svg>
            </Link>
            {mode === "dashboard" && (
              <span className="hidden md:inline-flex items-center gap-1 text-[30px] text-[#526770] font-medium">
                {profileInitials}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </span>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
