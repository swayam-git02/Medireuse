import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-50 border-t border-green-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-green-600">MediReuse</h2>
          <p className="text-sm text-gray-600 mt-3">
            Smart platform to resell unused medicines and safely dispose expired ones.
            Helping people & protecting the environment.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="hover:text-green-600 cursor-pointer">Home</li>
            <li className="hover:text-green-600 cursor-pointer">About</li>
            <li className="hover:text-green-600 cursor-pointer">Features</li>
            <li className="hover:text-green-600 cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Services</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Sell Medicines</li>
            <li>Buy Medicines</li>
            <li>Safe Disposal</li>
            <li>Track Orders</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <Mail size={16} /> support@medireuse.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> India
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 text-gray-600">
            <Facebook className="hover:text-green-600 cursor-pointer" />
            <Twitter className="hover:text-green-600 cursor-pointer" />
            <Linkedin className="hover:text-green-600 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-sm text-gray-500 border-t border-green-100 py-4">
        © {new Date().getFullYear()} MediReuse. All rights reserved.
      </div>
    </footer>
  );
}
