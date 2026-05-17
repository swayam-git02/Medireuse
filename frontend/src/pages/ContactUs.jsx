import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import BackButton from "../components/BackButton.jsx";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

export default function ContactUs() {
  const [form, setForm] = useState(initialForm);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (successMessage) setSuccessMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccessMessage("Thanks for contacting us. Our team will get back to you soon.");
    setForm(initialForm);
  };

  return (
    <main className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
      <div className="mx-auto mb-4 max-w-7xl px-4 md:px-6">
        <BackButton />
      </div>

      <section className="mx-auto max-w-7xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-6 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:p-8">
        <div className="grid gap-6 rounded-3xl border border-[#d6ebe4] bg-white/70 p-6 md:grid-cols-[1fr_1fr] md:p-8">
          <article>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f7f68]">Contact Us</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#1f3d3a] md:text-4xl">We’d Love to Hear From You</h1>
            <p className="mt-4 text-sm leading-relaxed text-[#5b7570] md:text-base">
              Have a query about listings, orders, or medicine safety? Reach out and our support team will assist you.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="flex items-start gap-3 rounded-xl border border-[#d7e9e3] bg-white/85 px-4 py-3">
                <Mail size={18} className="mt-0.5 text-[#2f7f68]" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7f9d95]">Email</p>
                  <p className="text-sm font-medium text-[#1f3d3a]">support@medireuse.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#d7e9e3] bg-white/85 px-4 py-3">
                <Phone size={18} className="mt-0.5 text-[#2f7f68]" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7f9d95]">Phone</p>
                  <p className="text-sm font-medium text-[#1f3d3a]">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#d7e9e3] bg-white/85 px-4 py-3">
                <MapPin size={18} className="mt-0.5 text-[#2f7f68]" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#7f9d95]">Location</p>
                  <p className="text-sm font-medium text-[#1f3d3a]">India</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d6ebe4] bg-white/85 p-5 md:p-6">
            <h2 className="text-xl font-semibold text-[#1f3d3a]">Send a Message</h2>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82]"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82]"
                required
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Type your message..."
                rows={5}
                className="resize-none rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82]"
                required
              />

              {successMessage && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
              )}

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Send Message
              </button>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
