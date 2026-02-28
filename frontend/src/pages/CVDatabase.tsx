import { useFetchCandidates } from "@/hooks/useFetchCandidates";
import { useState } from "react";
import PdfPreviewOverlay from "../components/PdfPreviewOverlay";
import { deleteCandidate } from "@/api/candidateActions";
import { Link } from "react-router";
import { AddNewCVModal } from "@/components/addNewCv/AddNewCVModal";
import { Spinner } from "@/components/ui/spinner";
import type { CandidatePreview } from "@/types/candidate";

function handleEdit(id: number) {
  console.log("Edit", id);
}

function CVDatabase() {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, isError, isLoading } = useFetchCandidates(reloadKey);
  const [search, setSearch] = useState("");

  // Needed now for preview + rendering
  const [previewId, setPreviewId] = useState<number | null>(null);
  function showPreview(id: number) {
    setPreviewId(id);
  }

  if (isError) {
    return <div>Error.</div>;
  }

  if (isLoading || !data) {
    return (
      <main className="flex justify-center items-center h-170">
        <Spinner />
      </main>
    );
  }

  const filtered = data.filter((c) =>
    (c.name ?? c.id.toString()).toLowerCase().includes(search.toLowerCase()),
  );

  const candidates: CandidatePreview[] = filtered
    // only include candidates that actually have a CV
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name ?? `Candidate ${candidate.id}`,
    }));

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        "Er du sikker på at du vil slette " +
          name +
          "? Denne handlingen kan ikke angres.",
      )
    )
      return;
    try {
      await deleteCandidate(id);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      alert("Feil ved sletting: " + (error as Error).message);
    }
  };

  return (
    <main className="bg-gray-50 px-4 py-6 sm:px-8">
      <nav className="text-sm text-gray-400 mb-4 flex items-center gap-1">
        <Link to="/" className="hover:text-gray-600 cursor-pointer">
          Hjem
        </Link>
        <span>›</span>
        <span className="text-gray-600">CV Database</span>
      </nav>

      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <article>
          <h1 className="text-2xl font-bold text-gray-900">CV Database</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administrer ansattes CV-er for screening.
          </p>
        </article>
        <AddNewCVModal onCreated={() => setReloadKey((k) => k + 1)} />
      </section>

      <section className="bg-white --color-primary rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search */}
        <article className="px-5 py-4 border-b border-gray-100">
          <div className="relative">
            <img
              src="src/assets/icons/search-grey.svg"
              alt="search icon"
              className="w-5 h-5 opacity-60 hover:opacity-90 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Søk på navn"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </article>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Navn
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Sist endret
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-center text-gray-400 uppercase tracking-wider">
                  Pdf
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="hover:bg-gray-50 transition-colors duration-100"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">
                    {candidate.name ?? candidate.id}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "medium",
                    }).format(new Date(candidate.created_at))}
                  </td>

                  {candidate.cv_pdf ? (
                    <td className="py-3 text-center">
                      <button
                        onClick={() => showPreview(candidate.id)}
                        className="cursor-pointer"
                      >
                        <img
                          src="src/assets/icons/file-pdf-solid.svg"
                          alt="open pdf"
                          className="w-5 h-5 opacity-70 hover:opacity-100"
                        />
                      </button>
                    </td>
                  ) : (
                    <td></td>
                  )}

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleEdit(candidate.id)}
                      className="inline-flex cursor-pointer items-center justify-center w-8 h-8 rounded-md hover:bg-grey-700 transition-colors duration-150"
                      title="Delete candidate"
                    >
                      <img
                        src="src/assets/icons/edit-solid.svg"
                        alt="edit candidate"
                        className="w-5 h-5 opacity-70 hover:opacity-100"
                      />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          candidate.id,
                          candidate.name ?? `Kandidat ${candidate.id}`,
                        )
                      }
                      className="inline-flex items-center cursor-pointer justify-center w-8 h-8 rounded-md text-red-400 hover:text-red-600 transition-colors duration-150"
                      title="Delete candidate"
                    >
                      <img
                        src="src/assets/icons/trash-alt-solid.svg"
                        alt="delete candidate"
                        className="w-5 h-5 opacity-70 hover:opacity-100"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <article className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">
            Viser {filtered.length} av {data.length} CV-er
          </p>
        </article>
      </section>

      {/* Rendering PDF view */}
      {previewId != null && (
        <PdfPreviewOverlay
          candidates={candidates}
          initialId={previewId}
          onClose={() => setPreviewId(null)}
        />
      )}
    </main>
  );
}

export default CVDatabase;
