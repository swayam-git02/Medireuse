import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email === email && user.password === password) {
      alert("Login Successful!");
      navigate("/");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/auth-bg.png')" }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-green-900/30"></div>

      <form
        onSubmit={handleLogin}
        className="relative bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-[380px] animate-fadeIn"
      >
        <h2 className="text-3xl font-bold text-green-600 mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Login to continue using MediReuse
        </p>

        <input
          type="email"
          placeholder="Email address"
          className="w-full border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-semibold">
          Login
        </button>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 font-medium">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
