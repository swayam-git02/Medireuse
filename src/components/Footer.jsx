import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-[#ecf8f2] text-[#1f2937]">
      <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-[#86efac]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#7dd3fc]/25 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-14">
        <div className="mb-10 rounded-2xl border border-[#cde7db] bg-white/80 backdrop-blur-sm p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-green-700">
              <ShieldCheck size={14} />
              Trusted Medicine Ecosystem
            </p>
            <h3 className="mt-2 text-2xl md:text-3xl font-semibold">
              Build a safer and smarter medicine cycle.
            </h3>
            <p className="mt-2 text-slate-600">
              Resell responsibly, dispose safely, and keep healthcare affordable.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-3 transition"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-[#b8d8cb] hover:border-[#93c5b3] hover:bg-white px-5 py-3 font-medium transition"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-green-700">MediReuse</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Smart platform to resell unused medicines and safely dispose expired
              ones while protecting both people and the environment.
            </p>
            <div className="mt-5 flex gap-3 text-slate-600">
              <a
                href="#"
                className="rounded-lg border border-[#b8d8cb] p-2 hover:bg-white transition"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="rounded-lg border border-[#b8d8cb] p-2 hover:bg-white transition"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                className="rounded-lg border border-[#b8d8cb] p-2 hover:bg-white transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#1f2937] mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-green-700 transition">How It Works</a>
              </li>
              <li>
                <a href="#" className="hover:text-green-700 transition">Verification</a>
              </li>
              <li>
                <a href="#" className="hover:text-green-700 transition">Safe Disposal</a>
              </li>
              <li>
                <a href="#" className="hover:text-green-700 transition">Track & Verify</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#1f2937] mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-green-700 transition">Home</Link>
              </li>
              <li>
                <a href="#features" className="hover:text-green-700 transition">Features</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-green-700 transition">Contact</a>
              </li>
              <li>
                <Link to="/signup" className="hover:text-green-700 transition">Create Account</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#1f2937] mb-3">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 text-green-700" />
                support@medireuse.com
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 text-green-700" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-green-700" />
                India
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#cde7db]">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-slate-600 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} MediReuse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-green-700 transition">Privacy Policy</a>
            <a href="#" className="hover:text-green-700 transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
