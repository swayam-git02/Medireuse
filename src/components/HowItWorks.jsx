const steps = [
  { step: "1", title: "List Your Medicines", color: "bg-green-500" },
  { step: "2", title: "Get Verified", color: "bg-blue-500" },
  { step: "3", title: "Sell or Dispose", color: "bg-red-500" },
  { step: "4", title: "Receive Payment", color: "bg-yellow-500" },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-10 text-center">
        <h2 className="text-3xl font-bold">How It Works</h2>
        <p className="text-gray-600 mt-2">
          Simple steps to resell or dispose your medicines safely
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow">
              <div
                className={`w-12 h-12 mx-auto flex items-center justify-center text-white rounded-full ${s.color}`}
              >
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
