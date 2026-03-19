import { useFetchPDF } from "@/hooks/useFetchPDF";
import type { CandidatePreview } from "@/types/candidate";
import { useMemo, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import ErrorBox from "@/components/ErrorBox"

type PdfPreviewOverlayProps = {
  candidates: CandidatePreview[];
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

  if (isError) {
    return(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <ErrorBox title="Feil ved innlastning" message="Kunne ikke laste PDF-filen."/>
      </div>
    );
  }

  if (isLoading) {
    return(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-primary"/>
          <span className="text-sm font-medium text-slate-700">Laster dokument...</span>
        </div>
      </div>
    );
  }

  function nextPdfPreview() {
    if (selectedIndex < candidates.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  }

  function prevPdfPreview() {
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
