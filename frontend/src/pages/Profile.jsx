import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, LoaderCircle, LogOut, Mail, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import authAPI from "../services/api";

export default function Profile() {
  // Profile page ka goal: logged-in user ki details dikhana aur quick actions dena.
  const navigate = useNavigate();

  // localStorage wale user se instant UI milta hai jab tak latest profile load ho.
  const [user, setUser] = useState(authAPI.getStoredUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // useEffect: page khulte hi login check + latest profile fetch chalata hai.
    if (!authAPI.isAuthenticated()) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await authAPI.getMe();
        if (response?.user) {
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      } catch (err) {
        setError(err.message || "Unable to load profile right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const profileInitials = useMemo(() => {
    // useMemo: initials ko tabhi dobara calculate karta hai jab name badle.
    const name = user?.name?.trim();
    if (!name) return "U";
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [user?.name]);

  const formatDate = (dateValue) => {
    // formatDate: raw date ko normal readable date me convert karta hai.
    if (!dateValue) return "Not available";
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = () => {
    // handleLogout: auth clear karke user ko login page bhejta hai.
    authAPI.logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
        <section className="mx-auto max-w-5xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-10 text-center shadow-[0_22px_44px_rgba(37,84,73,0.12)]">
          {/* animate-spin = loading icon ko ghumakar progress animation dikhata hai */}
          <LoaderCircle size={40} className="mx-auto animate-spin text-[#2f7f68]" />
          <p className="mt-4 text-[#3d5f57]">Loading your profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
      <div className="mx-auto mb-4 max-w-7xl px-4 md:px-6">
        <BackButton />
      </div>
      <section className="mx-auto grid max-w-5xl gap-6 rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-6 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <article className="rounded-3xl border border-[#d6ebe4] bg-white/80 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ddf2ea] text-xl font-semibold text-[#1f7f64]">
              {profileInitials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1f3d3a]">My Profile</h1>
              <p className="text-sm text-[#5b7570]">Manage your account details</p>
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="mt-6 grid gap-3">
            <div className="flex items-center justify-between rounded-xl border border-[#d7e9e3] bg-white px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-[#5b7570]">
                <UserRound size={16} />
                Full Name
              </p>
              <p className="font-medium text-[#1f3d3a]">{user?.name || "Not available"}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#d7e9e3] bg-white px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-[#5b7570]">
                <Mail size={16} />
                Email
              </p>
              <p className="font-medium text-[#1f3d3a]">{user?.email || "Not available"}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#d7e9e3] bg-white px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-[#5b7570]">
                <ShieldCheck size={16} />
                Account Type
              </p>
              <p className="font-medium capitalize text-[#1f3d3a]">{user?.role || "user"}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[#d7e9e3] bg-white px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-[#5b7570]">
                <CalendarDays size={16} />
                Joined On
              </p>
              <p className="font-medium text-[#1f3d3a]">{formatDate(user?.createdAt)}</p>
            </div>
          </div>
        </article>

        <aside className="rounded-3xl border border-[#d6ebe4] bg-white/80 p-6">
          <h2 className="text-xl font-semibold text-[#1f3d3a]">Quick Actions</h2>
          <p className="mt-1 text-sm text-[#5b7570]">Access your user sections quickly.</p>

          <div className="mt-5 grid gap-3">
            <Link
              to="/orders"
              // transition-colors = hover par card ka background smoothly change hota hai.
              className="flex items-center justify-between rounded-xl border border-[#d7e9e3] bg-[#f8fcfb] px-4 py-3 text-[#1f3d3a] transition-colors hover:bg-[#edf7f4]"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ClipboardList size={16} />
                My Orders
              </span>
              <span className="text-xs text-[#679086]">Open</span>
            </Link>

            <Link
              to="/my-listings"
              // transition-colors = hover par quick action card soft highlight leta hai.
              className="flex items-center justify-between rounded-xl border border-[#d7e9e3] bg-[#f8fcfb] px-4 py-3 text-[#1f3d3a] transition-colors hover:bg-[#edf7f4]"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShoppingBag size={16} />
                My Listings
              </span>
              <span className="text-xs text-[#679086]">Open</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            // transition-colors = logout button hover par red shade smoothly badalta hai.
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>
      </section>
    </main>
  );
}
