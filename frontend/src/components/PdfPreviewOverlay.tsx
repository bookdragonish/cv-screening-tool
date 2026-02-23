import { useFetchPDF } from "@/hooks/useFetchPDF";
import { useMemo, useState } from "react";

type Candidate = {
  id: number;
  name: string;
};

type PdfPreviewOverlayProps = {
  candidates: Candidate[];
  initialId: number;
  onClose: () => void;
};

function PdfPreviewOverlay({
  candidates,
  initialId,
  onClose,
}: PdfPreviewOverlayProps) {
  const initialIndex = useMemo(() => {
    const index = candidates.findIndex(
      (candidate) => candidate.id == initialId,
    );
    return index >= 0 ? index : 0;
  }, [candidates, initialId]);

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const selectedCandidate = candidates[selectedIndex];

  const { documentURL, isError, isLoading } = useFetchPDF(selectedCandidate.id);

  if (isError || !documentURL) {
    return <div>Error.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(candidates);

  function nextPdfPreview() {
    console.log(selectedCandidate, isError);
    if (selectedIndex < candidates.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  }

  function prevPdfPreview() {
    console.log(selectedCandidate, isError);
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  }

  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex < candidates.length - 1;

  if (!selectedCandidate) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-4 py-2 border-b">
          <h3 className="font-bold mb-4"> {selectedCandidate.name} </h3>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded enabled:hover:text-gray-200"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        {/* PDF viewer */}
        {documentURL ? (
          <iframe
            src={`${documentURL}#toolbar=0&navpanes=0&scrollbar=0`} /* This does not work in every browser type */
            className="w-full h-screen"
            style={{ border: "none" }}
          ></iframe>
        ) : (
          <div>Det eksisterer ingen CV for denne kandidaten</div>
        )}

        <footer className="flex justify-between mb-1">
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 enabled:hover:text-gray-200 m-5"
            onClick={prevPdfPreview}
            disabled={!hasPrevious}
          >
            Forrige
          </button>

          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 enabled:hover:text-gray-200 m-5"
            onClick={nextPdfPreview}
            disabled={!hasNext}
          >
            Neste
          </button>
        </footer>
      </div>
    </div>
  );
}

export default PdfPreviewOverlay;
