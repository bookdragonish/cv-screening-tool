import { useFetchPDF } from "@/hooks/useFetchPDF";
import { useState } from "react";


  type PdfPreviewOverlayProps = {
  documentIds: string[];
  initialId: number;
  onClose: () => void;
} 

function PdfPreviewOverlay({
  documentIds,
  initialId,
  onClose,
}: PdfPreviewOverlayProps) {

  const [selectedIndex, setSelectedIndex] = useState(initialId);  
  const { documentURL, isError, isLoading } = useFetchPDF("" + selectedIndex);

  if (isError || !documentURL) {
    return <div>Error.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  function nextPdfPreview() {
    if (selectedIndex < documentIds.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  }

  function prevPdfPreview() {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  }

  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex < documentIds.length - 1;

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
      <header className="flex justify-between items-center px-4 py-2 border-b">
        {/* <h3 className="font-bold mb-4"> {document.title} </h3>*/} 
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded enabled:hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>
      </header>

          {/* PDF viewer */}
        <iframe
            src={`${documentURL}#toolbar=0&navpanes=0&scrollbar=0`} /* This does not work in every browser type */
            className="w-full h-screen"
            style={{border: "none"}}
        ></iframe>

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
