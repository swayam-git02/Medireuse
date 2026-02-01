import { Pill, BadgeCheck, Biohazard, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Submit Medicines",
    desc: "Submit unused, non-expired medicines for resale or expired medicines for safe disposal.",
    icon: <Pill className="w-7 h-7 text-green-600" />,
    bg: "bg-green-100",
  },
  {
    title: "Buy Affordable Medicines",
    desc: "Our team verifies the details and approve listing.",
    icon: <BadgeCheck className="w-7 h-7 text-blue-600" />,
    bg: "bg-blue-100",
  },
  {
    title: "Dispose Expired Medicines",
    desc: "Expired medicines are scheduled for safe disposal.",
    icon: <Biohazard className="w-7 h-7 text-red-600" />,
    bg: "bg-red-100",
  },
  {
    title: "Track & Verify",
    desc: "Get paid for your non-expired medicines after a successful sale.",
    icon: <ShieldCheck className="w-7 h-7 text-emerald-600" />,
    bg: "bg-emerald-100",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {features.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-xl ${item.bg}`}
            >
              {item.icon}
            </div>

            <h3 className="mt-5 font-semibold text-lg">
              {item.title}
            </h3>
            <p className="mt-2 text-gray-600 text-sm">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
