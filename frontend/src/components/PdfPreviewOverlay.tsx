import { useFetchPDF } from "@/hooks/useFetchPDF";
import type { CandidatePreview } from "@/types/candidate";
import { useMemo, useRef, useState, useEffect } from "react";
import { LoaderCircleIcon, X, ChevronLeft, ChevronRight, FileQuestion } from "lucide-react";
import ErrorBox from "@/components/ErrorBox"
import { Button } from "@/components/ui/button";

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

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const selectedCandidate = candidates[selectedIndex];

  const { documentURL, isError, isLoading } = useFetchPDF(selectedCandidate.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }), [];

  if (isError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <ErrorBox title="Feil ved innlastning" message="Kunne ikke laste PDF-filen." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-primary" />
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
    <div className="fixed inset-0 flex items-center justify-center bg-primary/35" role="dialog" aria-modal="true" aria-label={`Forhåndsvisning for ${selectedCandidate.name}`}>
      <div className="bg-background w-full max-w-4xl h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden border border-border">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground"> {selectedCandidate.name} </h1>
          <Button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Lukk forhåndvisning"
            title="Lukk forhåndsvisning"
            variant="primary"
            className="cursor-pointer h-7 w-7 p-0 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>

        {/* PDF viewer */}
        <div className="flex-1 overflow-hidden bg-muted/30 p-4">
          {documentURL ? (
            <iframe
              src={`${documentURL}#toolbar=0&navpanes=0&scrollbar=0`} /* This does not work in every browser type */
              className="h-full w-full rounden-lg border border-border bg-background shadow-sm"
              title={`CV for ${selectedCandidate.name}`}
            ></iframe>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <FileQuestion className="h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">Det eksisterer ingen CV for denne kandidaten</p>

            </div>
          )}
        </div>
        <footer className="flex items-center justify-between border-t border-border px-6 py-4">
          {candidates.length > 1 && (
            <>
              <Button
                variant="primary"
                onClick={prevPdfPreview}
                disabled={!hasPrevious}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Forrige kandidat</span>
              </Button>

              <span className="text-sm font-medium text-muted-foreground">
                {selectedIndex + 1} av {candidates.length}
              </span>

              <Button
                variant="primary"
                onClick={nextPdfPreview}
                disabled={!hasNext}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Neste kandidat</span>
                <ChevronRight className="h-4 w-4 opacity-80" aria-hidden="true" />
              </Button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

export default PdfPreviewOverlay;
