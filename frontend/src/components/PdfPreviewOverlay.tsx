
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
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
      <header className="flex justify-between items-center px-4 py-2 border-b">
        <h3 className="font-bold mb-4">
          {document.title}
        </h3>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded enabled:hover:text-gray-200"
          onClick={onClose}
        >
          ✕
        </button>
      </header>

          {/* PDF viewer */}
        <iframe
            src={`${document.file}#toolbar=0&navpanes=0&scrollbar=0`} /* This does not work in every browser type */
            className="w-full h-screen"
            style={{border: "none"}}
        ></iframe>

        <footer className="flex justify-between mb-1">
          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 enabled:hover:text-gray-200 m-5"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            Forrige
          </button>

          <button
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 enabled:hover:text-gray-200 m-5"
            onClick={onNext}
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
