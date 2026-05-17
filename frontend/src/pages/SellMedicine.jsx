import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FileText, FlaskConical, ImagePlus, Pill, Trash2 } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import { authAPI, medicineAPI, uploadAPI } from "../services/api.js";

// Yeh form ka default/initial data hai, page load hote hi yahi values rehti hain.
const initialFormState = {
  medicineName: "",
  medicineSalt: "",
  shortDescription: "",
  expiryDate: "",
  quantity: "1",
  mrp: "",
  imagePreview: "",
  imageData: "",
};

export default function SellMedicine() {
  // Sell page ka kaam: form se medicine detail lena, image upload karna, listing save karna.
  const navigate = useNavigate();
  // formData me user jo form me type karta hai wo store hota hai.
  const [formData, setFormData] = useState(initialFormState);
  // listedMedicines me submit ki gayi medicines ki list store hoti hai.
  const [listedMedicines, setListedMedicines] = useState([]);
  // error message dikhane ke liye.
  const [error, setError] = useState("");
  // success message dikhane ke liye.
  const [successMessage, setSuccessMessage] = useState("");
  // Submit ke time loading dikhane ke liye.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Existing listings backend se load ho rahi hain ya nahi.
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [deletingMedicineId, setDeletingMedicineId] = useState("");
  // File input ko reset karne ke liye ref use kar rahe hain.
  const imageInputRef = useRef(null);

  // normalizeMedicineForCard: backend response ko UI card ke same format me set karta hai.
  const normalizeMedicineForCard = (medicine) => ({
    id: medicine?._id || medicine?.id || medicine?.imagePublicId || Date.now(),
    backendId: medicine?._id || medicine?.backendId || "",
    medicineName: medicine?.medicineName || "",
    medicineSalt: medicine?.medicineSalt || "",
    shortDescription: medicine?.shortDescription || "",
    expiryDate: medicine?.expiryDate || "",
    medicineType: medicine?.medicineType || "Other",
    quantity: Number(medicine?.quantity ?? 1),
    pricePerUnit: Number(medicine?.pricePerUnit ?? 0),
    mrp: Number(medicine?.mrp ?? medicine?.pricePerUnit ?? 0),
    imageUrl: medicine?.imageUrl || "",
    listedAt: medicine?.createdAt || medicine?.listedAt || new Date().toISOString(),
  });

  useEffect(() => {
    // useEffect: page khulte hi user ki purani listings load karta hai.
    if (!authAPI.isAuthenticated()) return;

    let isMounted = true;

    const loadMyListings = async () => {
      setIsLoadingListings(true);
      try {
        const response = await medicineAPI.getMyMedicines();
        if (!isMounted) return;

        const medicines = Array.isArray(response?.medicines) ? response.medicines : [];
        setListedMedicines(medicines.map(normalizeMedicineForCard));
      } catch (loadError) {
        if (!isMounted) return;
        const message = loadError.message || "Could not load your existing listings.";
        setError(message);
      } finally {
        if (isMounted) setIsLoadingListings(false);
      }
    };

    loadMyListings();

    return () => {
      isMounted = false;
    };
  }, []);

  // handleInputChange function: text/date fields me typing hote hi state update karta hai.
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
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

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Please upload an image smaller than 5 MB.");
      return;
    }

    // FileReader browser ka built-in function hai jo file ko readable format me convert karta hai.
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        // imagePreview me base64 image save hoti hai jisse turant preview dikhta hai.
        imagePreview: typeof reader.result === "string" ? reader.result : "",
        imageData: typeof reader.result === "string" ? reader.result : "",
      }));
      setError("");
      setSuccessMessage("");
    };
    reader.onerror = () => {
      setError("Image upload me issue aaya. Please try again.");
    };
    reader.readAsDataURL(selectedFile);
  };

  // handleSubmit function: form submit pe validation karke medicine list me add karta hai.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const { medicineName, medicineSalt, shortDescription, expiryDate, quantity, mrp, imagePreview, imageData } =
      formData;
    const parsedQuantity = Number(quantity);
    const parsedMrp = Number(mrp);

    // Agar koi field khali hai to submit rok dete hain.
    if (
      !medicineName.trim() ||
      !medicineSalt.trim() ||
      !shortDescription.trim() ||
      !expiryDate ||
      !imagePreview ||
      !mrp
    ) {
      setError("Please fill all fields and upload medicine image.");
      setSuccessMessage("");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setError("Quantity must be at least 1 unit.");
      setSuccessMessage("");
      return;
    }

    if (Number.isNaN(parsedMrp) || parsedMrp < 0) {
      setError("MRP cannot be negative.");
      setSuccessMessage("");
      return;
    }

    if (!authAPI.isAuthenticated()) {
      setError("Please log in before listing a medicine.");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // Step-1: pehle image Cloudinary par upload hoti hai.
      const uploadResponse = await uploadAPI.uploadMedicineImage(imageData);
      // Step-2: image URL ke saath medicine details backend DB me save hoti hain.
      const createResponse = await medicineAPI.createMedicine({
        medicineName: medicineName.trim(),
        medicineSalt: medicineSalt.trim(),
        shortDescription: shortDescription.trim(),
        expiryDate,
        imageUrl: uploadResponse.imageUrl,
        imagePublicId: uploadResponse.publicId || "",
        medicineType: "Other",
        quantity: parsedQuantity,
        pricePerUnit: parsedMrp,
        mrp: parsedMrp,
      });

      if (!createResponse?.medicine?._id) {
        throw new Error("Listing save failed. Please try again.");
      }

      // Yeh object ek nayi listed medicine ko represent karta hai.
      const createdListing = normalizeMedicineForCard(createResponse.medicine);

      setListedMedicines((prev) => [createdListing, ...prev]);
      setFormData(initialFormState);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setSuccessMessage("Medicine listed successfully.");
    } catch (submitError) {
      const errorMessage = submitError.message || "Medicine listing failed. Please try again.";

      if (errorMessage.toLowerCase().includes("session expired")) {
        authAPI.logout();
        setError("Your session has expired. Please log in again to list medicines.");
        navigate("/login", { state: { from: "/sell-medicine" } });
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicine = async (medicine) => {
    const medicineId = medicine?.backendId || "";

    if (!medicineId) {
      setError("This listing could not be deleted because its server ID is missing. Please refresh the page.");
      setSuccessMessage("");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this listed medicine?");
    if (!confirmed) return;

    if (!authAPI.isAuthenticated()) {
      setError("Please log in before deleting a medicine listing.");
      setSuccessMessage("");
      return;
    }

    setDeletingMedicineId(medicineId);
    setError("");
    setSuccessMessage("");

    try {
      await medicineAPI.deleteMedicine(medicineId);
      setListedMedicines((prev) => prev.filter((item) => item.backendId !== medicineId));
      // Notify other views/tabs so Browse page can remove this listing immediately.
      window.dispatchEvent(new CustomEvent("medicine:deleted", { detail: { id: medicineId } }));
      localStorage.setItem(
        "medireuse_deleted_medicine",
        JSON.stringify({ id: medicineId, at: Date.now() })
      );
      setSuccessMessage("Medicine listing deleted successfully.");
    } catch (deleteError) {
      const errorMessage = deleteError.message || "Failed to delete medicine listing.";

      if (errorMessage.toLowerCase().includes("session expired")) {
        authAPI.logout();
        setError("Your session has expired. Please log in again to manage listings.");
        navigate("/login", { state: { from: "/sell-medicine" } });
      } else {
        setError(errorMessage);
      }
    } finally {
      setDeletingMedicineId("");
    }
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
      <div className="mx-auto mb-4 max-w-7xl px-4 md:px-6">
        <BackButton />
      </div>
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

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                  <span>No. of Tablets</span>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82] md:text-base"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                  <span>MRP per Tablet (Rs)</span>
                  <input
                    type="number"
                    name="mrp"
                    min="0"
                    step="0.01"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    placeholder="e.g. 150"
                    className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-3 text-sm text-[#1f3d3a] outline-none transition focus:border-[#37aa82] md:text-base"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-[#3d5f57]">
                <span className="flex items-center gap-2">
                  <ImagePlus size={16} />
                  Image of the Medicine
                </span>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isSubmitting}
                  // onChange me handleImageChange function file ko preview ke liye read karta hai.
                  onChange={handleImageChange}
                  className="rounded-xl border border-[#d3e7e0] bg-white px-4 py-2.5 text-sm text-[#1f3d3a] file:mr-4 file:rounded-lg file:border-0 file:bg-[#e4f7f0] file:px-3 file:py-2 file:text-[#1f7f64]"
                />
                <p className="text-xs text-[#6f8d85]">Image uploads to Cloudinary when you submit the listing.</p>
              </label>

              {/* Validation ya upload issue aaya to error yaha show hota hai */}
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {/* Submit success hone par confirmation message yaha show hota hai */}
              {successMessage && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                // transition-opacity = hover karne par button halka transparent smooth tareeke se hota hai.
                className="mt-1 rounded-xl bg-gradient-to-r from-[#37aa82] to-[#2e9d79] px-5 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Uploading..." : "Submit Listing"}
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

          {isLoadingListings ? (
            <div className="mt-4 rounded-2xl border border-[#d6ebe4] bg-white/80 p-5 text-center">
              <p className="text-sm text-[#5b7570]">Loading your listed medicines...</p>
            </div>
          ) : listedMedicines.length === 0 ? (
            // Agar abhi koi listing nahi hai to empty state message
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
                    src={medicine.imageUrl || medicine.imagePreview}
                    alt={medicine.medicineName}
                    className="h-40 w-full rounded-xl border border-[#d7e9e3] object-cover"
                  />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-[#223f3a]">{medicine.medicineName}</h3>
                    <p className="mt-1 text-sm text-[#2f7f68]">Salt: {medicine.medicineSalt}</p>
                    <p className="mt-2 text-sm text-[#6b8781]">{medicine.shortDescription}</p>
                    <p className="mt-2 text-sm text-[#466962]">Type: {medicine.medicineType}</p>
                    <p className="mt-1 text-sm text-[#466962]">Tablets: {medicine.quantity}</p>
                    <p className="mt-2 text-base font-semibold text-[#1f3d3a]">MRP/Tablet: Rs {medicine.mrp}</p>
                    {/* formatDate function use karke readable date dikhayi ja rahi hai */}
                    <p className="mt-3 text-sm text-[#466962]">Expiry: {formatDate(medicine.expiryDate)}</p>
                    <p className="mt-1 text-xs text-[#7f9d95]">Listed: {formatDate(medicine.listedAt)}</p>

                    <button
                      type="button"
                      onClick={() => handleDeleteMedicine(medicine)}
                      disabled={deletingMedicineId === medicine.backendId || !medicine.backendId}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                      {deletingMedicineId === medicine.backendId ? "Deleting..." : "Delete Listing"}
                    </button>
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
