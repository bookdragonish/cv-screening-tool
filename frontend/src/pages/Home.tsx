import { Link } from "react-router";
import { FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import PdfPreviewOverlay from "../components/PdfPreviewOverlay";
import placeholder1 from "../assets/pdfs/placeholder1.pdf";
import placeholder2 from "../assets/pdfs/placeholder2.pdf";
import placeholder3 from "../assets/pdfs/placeholder3.pdf";

function Home() {
  const screeningActivities = [
    {
      title: "Senior Developer",
      date: "28 Jan 2026",
    },
    {
      title: "Project Manager",
      date: "25 Jan 2026",
    },
    {
      title: "UX Designer",
      date: "22 Jan 2026",
    },
    {
      title: "Data Analyst",
      date: "20 Jan 2026",
    },
    {
      title: "System Administrator",
      date: "18 Jan 2026",
    },
  ];


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
    <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Oversikt</h2>
          <p className="text-gray-600">
            Velkommen tilbake! Her er en oversikt over dine CV-screeningaktiviteter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - recent activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Screening history header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nylig screeningaktivitet
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Dine siste CV-screeningresultater
                </p>
              </div>
              {/* Screening activity list */}
              <div className="divide-y divide-gray-200">
                {screeningActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{activity.date}</span>
                      </div>
                    </div>
                    <Link
                      to="/screening-history"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Se resultater
                    </Link>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-200 text-center">
                <Link
                  to="/screening-history"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1"
                >
                  Se hele screeninghistorikken →
                </Link>
              </div>
            </div>
          </div>

          {/* Right column - actions */}
          <div className="space-y-6">
            {/* Start new screening card */}
            <div className="bg-blue-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Start ny screening</h3>
              <p className="text-blue-100 text-sm mb-6">
                Last opp en stillingsbeskrivelse for å matche kandidater fra CV-databasen
              </p>
              <Button
                asChild
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium"
              >
                <Link to="/screening" className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Start screening
                </Link>
              </Button>
            </div>

            {/* CV ddatabase card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-gray-100 rounded-lg p-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CV-database</h3>
                  <p className="text-sm text-gray-600 mt-1">68 aktive CVer</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link to="/cv-database">Administrer CVer</Link>
              </Button>
            </div>
          </div>
        
{/*         <div className="mt-6">
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
        )} */}
        </div>
    </main>
  );
}

export default Home;
