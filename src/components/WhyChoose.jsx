import { Recycle, IndianRupee, Leaf } from "lucide-react";

export default function WhyChoose() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose <span className="text-green-600">MediReuse?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-green-50 rounded-xl p-6 text-center shadow hover:shadow-lg transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Recycle className="text-green-600" size={28} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Reduce Medicine Waste</h3>
            <p className="text-gray-600 text-sm">
              Prevent unused medicines from being wasted and ensure safe disposal.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-green-50 rounded-xl p-6 text-center shadow hover:shadow-lg transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-4">
              <IndianRupee className="text-green-600" size={28} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Affordable Healthcare</h3>
            <p className="text-gray-600 text-sm">
              Buy verified medicines at lower prices for everyone.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-green-50 rounded-xl p-6 text-center shadow hover:shadow-lg transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Leaf className="text-green-600" size={28} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Eco-Friendly Disposal</h3>
            <p className="text-gray-600 text-sm">
              Environment-safe disposal of expired medicines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
