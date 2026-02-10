
import { useState } from "react";

function Home() {

  const [documents, setDocuments] = useState([
    {id: 1, title: "cv 1", file: "placeholder1.pdf"},
    {id: 2, title: "cv 2", file: "placeholder2.pdf"},
    {id: 3, title: "cv 3", file: "placeholder3.pdf"},
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
                className="text-gray-200 cursor-pointer hover:text-white"
                onClick={()=> {
                  setSelectedIndex(index);
                  setIsPreviewOpen(true);
                }}
              >
                {doc.title}
              </li>
            ))}
          </ul>
        </div>
        {isPreviewOpen && selectedIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/2">
              <h3 className="font-bold mb-4">
                Previewing: {documents[selectedIndex].title}
              </h3>
              <button 
                className="px-4 py-2 bg-gray-700 text-white rounded"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home;
