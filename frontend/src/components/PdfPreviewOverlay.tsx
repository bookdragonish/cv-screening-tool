
type Document = {
  id: number;
  title: string;
  file: string;
};

type PdfPreviewOverlayProps = {
  document: Document;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

function PdfPreviewOverlay({
  document,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onClose,
}: PdfPreviewOverlayProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
        <h3 className="font-bold mb-4">
          {document.title}
        </h3>

          {/* PDF viewer */}
        <iframe
            src={document.file}
            className="w-full h-screen"
            style={{border: "none"}}
        ></iframe>

        <div className="flex justify-between mb-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 enabled:hover:text-gray-200"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            Previous
          </button>

          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 enabled:hover:text-gray-200"
            onClick={onNext}
            disabled={!hasNext}
          >
            Next
          </button>
        </div>

        <button
          className="px-4 py-2 bg-gray-700 text-white rounded enabled:hover:text-gray-200"
          onClick={onClose}
        >
          Close
        </button>
    </div>
  );
}

export default PdfPreviewOverlay;
