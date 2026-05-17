import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomeRoute = location.pathname === "/";

  if (isHomeRoute) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-xl border border-[#cde6de] bg-white/85 px-4 py-2 text-sm font-medium text-[#2b5a50] transition-colors hover:bg-[#ecf7f3] ${className}`}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
