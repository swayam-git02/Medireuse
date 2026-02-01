import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(form));
    alert("Signup Successful!");
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/auth-bg.png')" }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-green-900/30"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-[400px] animate-fadeIn"
      >
        <h2 className="text-3xl font-bold text-green-600 mb-2 text-center">
          Create Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Join MediReuse & reduce medicine waste
        </p>

        <input
          placeholder="Full Name"
          className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email address"
          className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Create password"
          className="w-full border rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-semibold">
          Sign Up
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
