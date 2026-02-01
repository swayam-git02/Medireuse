import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white shadow">
      <h1 className="text-2xl font-bold text-green-600">
        <Link to="/">MediReuse</Link>
      </h1>

      <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
        <li>
          <Link to="/" className="hover:text-green-600">
            Home
          </Link>
        </li>
        <li>
          <Link to="#about" className="hover:text-green-600">
            About
          </Link>
        </li>
        <li>
          <Link to="#features" className="hover:text-green-600">
            Features
          </Link>
        </li>
        <li>
          <Link to="#contact" className="hover:text-green-600">
            Contact
          </Link>
        </li>
      </ul>

      <div className="flex gap-3">
        <Link
          to="/login"
          className="px-5 py-2 rounded-full border border-green-500 text-green-600 hover:bg-green-50"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
