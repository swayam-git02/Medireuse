import { useRef, useState } from "react";
import { CalendarDays, FileText, FlaskConical, ImagePlus, Pill } from "lucide-react";

// Yeh form ka default/initial data hai, page load hote hi yahi values rehti hain.
const initialFormState = {
  medicineName: "",
  medicineSalt: "",
  shortDescription: "",
  expiryDate: "",
  imagePreview: "",
};

export default function SellMedicine() {
  // formData me user jo form me type karta hai wo store hota hai.
  const [formData, setFormData] = useState(initialFormState);
  // listedMedicines me submit ki gayi medicines ki list store hoti hai.
  const [listedMedicines, setListedMedicines] = useState([]);
  // error message dikhane ke liye.
  const [error, setError] = useState("");
  // success message dikhane ke liye.
  const [successMessage, setSuccessMessage] = useState("");
  // File input ko reset karne ke liye ref use kar rahe hain.
  const imageInputRef = useRef(null);

  // handleInputChange function: text/date fields me typing hote hi state update karta hai.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // handleImageChange function: image file ko read karke preview ke liye save karta hai.
  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Sirf image file allow kar rahe hain.
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload only image file for medicine photo.");
      return;
    }

    // FileReader browser ka built-in function hai jo file ko readable format me convert karta hai.
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        // imagePreview me base64 image save hoti hai jisse turant preview dikhta hai.
        imagePreview: typeof reader.result === "string" ? reader.result : "",
      }));
      setError("");
    };
    reader.onerror = () => {
      setError("Image upload me issue aaya. Please try again.");
    };
    reader.readAsDataURL(selectedFile);
  };

  // handleSubmit function: form submit pe validation karke medicine list me add karta hai.
  const handleSubmit = (event) => {
    event.preventDefault();

    const { medicineName, medicineSalt, shortDescription, expiryDate, imagePreview } = formData;
    // Agar koi field khali hai to submit rok dete hain.
    if (!medicineName.trim() || !medicineSalt.trim() || !shortDescription.trim() || !expiryDate || !imagePreview) {
      setError("Please fill all fields and upload medicine image.");
      setSuccessMessage("");
      return;
    }

    // Yeh object ek nayi listed medicine ko represent karta hai.
    const newListing = {
      id: Date.now(),
      medicineName: medicineName.trim(),
      medicineSalt: medicineSalt.trim(),
      shortDescription: shortDescription.trim(),
      expiryDate,
      imagePreview,
      listedAt: new Date().toISOString(),
    };

    setListedMedicines((prev) => [newListing, ...prev]);
    setFormData(initialFormState);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setError("");
    setSuccessMessage("Medicine listed successfully.");
  };

  // formatDate function: raw date ko user-friendly date format me convert karta hai.
  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    // Note: Is page me alag JS animation library nahi use hui; mostly normal UI + transition classes use hui hain.
    <main className="min-h-screen bg-[url('/sell-page-bg.png')] bg-cover bg-center px-4 pb-14 pt-4 md:px-8">
      <section className="mx-auto max-w-7xl rounded-[30px] border border-[#c9e2dc] bg-[#eaf8f4]/90 p-6 shadow-[0_22px_44px_rgba(37,84,73,0.12)] md:p-8">
        <div className="grid gap-6 rounded-3xl border border-[#d6ebe4] bg-white/70 p-5 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div>
            <h1 className="text-2xl font-semibold text-[#1f3d3a] md:text-3xl">List Your Medicine</h1>
            <p className="mt-2 text-sm text-[#5b7570] md:text-base">
              Submit medicine details to list your unused stock safely.
            </p>

            {/* onSubmit me handleSubmit function call hota hai */}
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                <span className="flex items-center gap-2">
                  <Pill size={16} />
                  Name of Medicine
                </span>
                <input
                  type="text"
                  name="medicineName"
                  value={formData.medicineName}
                  // onChange me handleInputChange function field value update karta hai.
                  onChange={handleInputChange}
                  placeholder="Example: Paracetamol 650"
                  // transition = focus pe border change smooth way me dikhta hai.
                  className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82] md:text-base"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                <span className="flex items-center gap-2">
                  <FlaskConical size={16} />
                  Salt of the Medicine
                </span>
                <input
                  type="text"
                  name="medicineSalt"
                  value={formData.medicineSalt}
                  // onChange me handleInputChange function call hota hai.
                  onChange={handleInputChange}
                  placeholder="Example: Acetaminophen"
                  // transition = focus visual soft/smooth lagta hai.
                  className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82] md:text-base"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                <span className="flex items-center gap-2">
                  <FileText size={16} />
                  Short Description
                </span>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  // onChange me handleInputChange function call hota hai.
                  onChange={handleInputChange}
                  placeholder="Example: fever, body pain"
                  rows={3}
                  // transition = focus ke time border change smoothly hota hai.
                  className="resize-none rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82] md:text-base"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Expiry Date
                </span>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  // onChange me handleInputChange function call hota hai.
                  onChange={handleInputChange}
                  // transition = input interaction ko smooth feel deta hai.
                  className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82] md:text-base"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                <span className="flex items-center gap-2">
                  <ImagePlus size={16} />
                  Image of the Medicine
                </span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  // onChange me handleImageChange function file ko preview ke liye read karta hai.
                  onChange={handleImageChange}
                  className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-2.5 text-sm text-[#1f3d3a] file:mr-4 file:rounded-lg file:border-0 file:bg-[#e4f7f0] file:px-3 file:py-2 file:text-[#1f7f64]"
                />
              </label>

              {/* Validation ya upload issue aaya to error yaha show hota hai */}
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {/* Submit success hone par confirmation message yaha show hota hai */}
              {successMessage && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>}

              <button
                type="submit"
                // transition-opacity = hover karne par button halka transparent smooth tareeke se hota hai.
                className="mt-1 rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-5 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
              >
                Submit Listing
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-[#d6ebe4] bg-white/90 p-4 md:p-5">
            <h2 className="text-lg font-semibold text-[#1f3d3a] md:text-xl">Image Preview</h2>
            <p className="mt-1 text-sm text-[#6b8781]">Uploaded medicine image will appear here.</p>

            {/* Yaha live preview dikhata hai: image select hui to photo, warna placeholder */}
            <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-[#cce3db] bg-[#f5fbf9] p-3">
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="Medicine preview"
                  className="h-full max-h-[240px] w-full rounded-lg object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImagePlus size={38} className="mx-auto text-[#9ab7ae]" />
                  <p className="mt-2 text-sm text-[#6f8d85]">No image selected yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1f3d3a] md:text-2xl">My Listed Medicines</h2>
            {/* Kitni medicines list hui hain uska count */}
            <span className="rounded-full bg-[#ddf2ea] px-3 py-1 text-sm font-medium text-[#2f7f68]">
              {listedMedicines.length} item(s)
            </span>
          </div>

          {/* Agar abhi koi listing nahi hai to empty state message */}
          {listedMedicines.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-[#d6ebe4] bg-white/80 p-8 text-center">
              <p className="text-base text-[#5b7570]">No medicines listed yet. Fill the form above to add your first listing.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {/* map function har listed medicine ko card me convert karke render karta hai */}
              {listedMedicines.map((medicine) => (
                <article
                  key={medicine.id}
                  className="rounded-2xl border border-[#dcebe7] bg-white/85 p-4 shadow-[0_8px_18px_rgba(24,64,58,0.08)]"
                >
                  <img
                    src={medicine.imagePreview}
                    alt={medicine.medicineName}
                    className="h-40 w-full rounded-xl border border-[#d7e9e3] object-cover"
                  />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-[#223f3a]">{medicine.medicineName}</h3>
                    <p className="mt-1 text-sm text-[#2f7f68]">Salt: {medicine.medicineSalt}</p>
                    <p className="mt-2 text-sm text-[#6b8781]">{medicine.shortDescription}</p>
                    {/* formatDate function use karke readable date dikhayi ja rahi hai */}
                    <p className="mt-3 text-sm text-[#466962]">Expiry: {formatDate(medicine.expiryDate)}</p>
                    <p className="mt-1 text-xs text-[#7f9d95]">Listed: {formatDate(medicine.listedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
