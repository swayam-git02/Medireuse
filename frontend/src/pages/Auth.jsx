import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { authAPI } from "../services/api";

export default function Auth({ initialMode = "login" }) {
  // navigate ka use successful login ke baad next page pe bhejne ke liye hota hai.
  const navigate = useNavigate();
  // location se pata chalta hai user kis page se yaha aaya tha.
  const location = useLocation();

  // isSignup decide karta hai ki Login form dikhe ya Sign Up form.
  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  // Login input values is state me store hoti hain.
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  // Signup input values alag state me store hoti hain.
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    // Agar parent se mode change aaye (login/signup), to UI ko sync kar dete hain.
    setIsSignup(initialMode === "signup");
  }, [initialMode]);

  // handleLogin function: login button dabate hi API call karta hai.
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await authAPI.login({
        email: loginForm.email,
        password: loginForm.password,
      });
      // authAPI.login token + user save kar deta hai (local storage me).
      const redirectTo = location.state?.from || "/";
      alert("Login Successful!");
      navigate(redirectTo);
    } catch (err) {
      alert(err.message || "Invalid Credentials");
    }
  };

  // handleSignup function: naya account create karne ke liye API call karta hai.
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
      });
      alert("Signup Successful! Please log in.");
      // Signup ke baad user ko login view me le aate hain.
      setIsSignup(false);
    } catch (err) {
      alert(err.message || "Signup failed");
    }
  };

  return (
    <>
      <Navbar showAuthButtons={false} showProfileIcon={true} />

      <section
        className="relative min-h-[calc(100vh-96px)] bg-no-repeat px-4 py-6 sm:px-6"
        style={{
          backgroundImage: "url('/auth_bg.png')",
          backgroundSize: "contain",
          backgroundPosition: "center center",
          backgroundColor: "#5f878c",
        }}
      >
        {/* Halka overlay readability improve karta hai */}
        <div className="absolute inset-0 bg-white/10" />

        <div className="relative mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl items-center justify-center md:justify-end md:pr-8 lg:pr-16">
          <div className="w-full max-w-md rounded-3xl border border-white/25 bg-white/10 p-3 backdrop-blur-sm shadow-[0_18px_60px_rgba(12,24,18,0.45)]">
            <div className="mb-4 grid grid-cols-2 rounded-2xl bg-white/20 p-1 text-sm font-semibold text-white">
              <button
                type="button"
                // onClick se login tab active hota hai.
                onClick={() => setIsSignup(false)}
                // transition = tab color smooth tareeke se change hota hai.
                className={`rounded-xl px-3 py-2 transition ${!isSignup ? "bg-white text-emerald-700" : "text-white/85"}`}
              >
                Login
              </button>
              <button
                type="button"
                // onClick se signup tab active hota hai.
                onClick={() => setIsSignup(true)}
                // transition = tab switch visual smooth lagta hai.
                className={`rounded-xl px-3 py-2 transition ${isSignup ? "bg-white text-emerald-700" : "text-white/85"}`}
              >
                Sign Up
              </button>
            </div>

            {/* auth-flip-card + is-signup class se login/signup card flip animation hota hai */}
            <div className="auth-scene">
              <div className={`auth-flip-card ${isSignup ? "is-signup" : ""}`}>
                {/* Login form */}
                <form onSubmit={handleLogin} className="auth-face auth-face-front">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/80">MediShop Access</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Welcome back</h2>
                  <p className="mt-2 text-sm text-slate-500">Log in to continue.</p>

                  <div className="mt-6 space-y-4">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={loginForm.email}
                      // onChange function typing ke saath email state update karta hai.
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      // transition + focus classes se border/ring smooth change hota hai.
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      // onChange function typing ke saath password state update karta hai.
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      // transition + focus classes se border/ring smooth change hota hai.
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                  </div>

                  <button className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700">
                    Login
                  </button>

                  <p className="mt-4 text-center text-sm text-slate-600">
                    New here?{" "}
                    <button type="button" onClick={() => setIsSignup(true)} className="font-semibold text-emerald-700 hover:text-emerald-800">
                      Create account
                    </button>
                  </p>
                </form>

                {/* Signup form */}
                <form onSubmit={handleSignup} className="auth-face auth-face-back">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/80">Join MediShop</p>
                  <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Create account</h2>
                  <p className="mt-2 text-sm text-slate-500">Sign up to get started.</p>

                  <div className="mt-6 space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={signupForm.name}
                      // onChange function typing ke saath name state update karta hai.
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={signupForm.email}
                      // onChange function typing ke saath email state update karta hai.
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Create password"
                      value={signupForm.password}
                      // onChange function typing ke saath password state update karta hai.
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    />
                  </div>

                  <button className="mt-6 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700">
                    Sign Up
                  </button>

                  <p className="mt-4 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setIsSignup(false)} className="font-semibold text-emerald-700 hover:text-emerald-800">
                      Login
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
