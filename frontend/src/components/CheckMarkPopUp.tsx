import { useEffect } from "react";
import { X } from "lucide-react";

type CheckMarkPopUpProps = {
  popup: { message: string; type: "success" | "error" } | null;
  setPopup: (popup: null) => void;
  duration?: number;
};

function CheckMarkPopUp({ popup, setPopup, duration = 3000 }: CheckMarkPopUpProps) {
  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => setPopup(null), duration);
    return () => clearTimeout(timer);
  }, [popup, duration, setPopup]);

  if (!popup) return null;

  const bgColor = popup.type === "success"
    ? "bg-green-100 border-green-500"
    : "bg-red-100 border-red-500";
  const textColor = popup.type === "success" ? "text-green-700" : "text-red-700";

  return (
    <div className={`fixed top-6 right-6 z-50 border-l-4 p-4 rounded shadow-lg ${bgColor} ${textColor} w-80`}>
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm">{popup.message}</p>
        <button
          className="ml-auto p-1 hover:bg-gray-200 rounded"
          onClick={() => setPopup(null)}
          aria-label="Lukk melding"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default CheckMarkPopUp;