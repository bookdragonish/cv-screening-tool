
import { useState } from "react";
import PdfPreviewOverlay from "../components/PdfPreviewOverlay";
import placeholder1 from "../assets/pdfs/placeholder1.pdf";
import placeholder2 from "../assets/pdfs/placeholder2.pdf";
import placeholder3 from "../assets/pdfs/placeholder3.pdf";

function Home() {

  const [documents, setDocuments] = useState([
    {id: 1, title: "cv 1", file: placeholder1},
    {id: 2, title: "cv 2", file: placeholder2},
    {id: 3, title: "cv 3", file: placeholder3},
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  function showPreview(index: number) {
    setSelectedIndex(index);
    setIsPreviewOpen(true);
  }

  function nextPdfPreview() {
    if (selectedIndex < documents.length - 1) {
          setSelectedIndex(selectedIndex+1)
    }
  }

  function prevPdfPreview() {
    if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1)
    }
  }

  return (
    <>
      <div className="w-full h-screen p-10">
        <label className="block mb-2 text-sm font-medium text-white">
          Upload resumes here:
        </label>
        <input 
          type="file" accept="application/pdf" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-300 focus:outline-none multiple"
        />
        
        {/* Step 1: render document list */}
        <div className="mt-6">
          <h2 className="text-white font-bold mb-2">Documents on this page:</h2>
          <ul>
            {documents.map((doc, index) => (
              <li 
                key={doc.id} 
                className="text-black cursor-pointer hover:text-gray-200"
                onClick={() => showPreview(index)}
              >
                {doc.title}
              </li>
            ))}
          </ul>
        </div>
        {isPreviewOpen && (
          <PdfPreviewOverlay
            document={documents[selectedIndex]}
            hasPrevious={selectedIndex > 0}
            hasNext={selectedIndex < documents.length - 1}
            onPrevious={prevPdfPreview}
            onNext={nextPdfPreview}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}
      </div>
    </>
  )
}

export default Home;
