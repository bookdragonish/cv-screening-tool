import { useFetchCandidates } from "@/hooks/useFetchCandidates";
import { useState } from "react";
import PdfPreviewOverlay from "../components/PdfPreviewOverlay";
import { deleteCandidate } from "@/api/candidateActions";
import { Link } from "react-router";
import { AddNewCVModal } from "@/components/addNewCv/AddNewCVModal";
import { Spinner } from "@/components/ui/spinner";
import type { CandidatePreview } from "@/types/candidate";
import ErrorBox from "@/components/ErrorBox";
import { Search } from "lucide-react";


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
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title={"Kan ikke hente kandidater"}
          message={"Prøv å refresh eller sjekke internet tilkoblingen"}
        />
      </section>
    );
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
    <main className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
        <Link
          to="/"
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          Hjem
        </Link>
        <span>›</span>
        <span className="text-(--color-dark)">CV Database</span>
      </nav>

      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <article>
          <h1 className="text-3xl font-semibold text-(--color-dark)">
            CV Database
          </h1>
          <p className="mt-2 text-(--color-dark) opacity-75">
            Administrer ansattes CV-er for screening.
          </p>
        </article>
        <AddNewCVModal onCreated={() => setReloadKey((k) => k + 1)} />
      </section>

      <div className="space-y-4">
        {/* Search */}
        <article>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-(--color-dark) opacity-50" />
            <input
              type="text"
              placeholder="Søk på navn"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-(--color-primary) bg-white py-2 pr-4 pl-10 text-(--color-dark) outline-none transition focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>
        </article>

        {/* Table */}
        <section className="overflow-hidden rounded-lg border border-(--color-primary) bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left">
              <thead>
                <tr className="border-b border-(--color-primary) bg-(--color-light)">
                  <th className="px-5 py-3 text-xs font-semibold tracking-wider text-(--color-dark) uppercase opacity-75">
                    Navn
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold tracking-wider text-(--color-dark) uppercase opacity-75">
                    Sist endret
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold tracking-wider text-(--color-dark) uppercase opacity-75">
                    Pdf
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold tracking-wider text-(--color-dark) uppercase opacity-75">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-primary)">
                {filtered.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="transition-colors duration-100 hover:bg-(--color-light)/40"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-(--color-dark)">
                      {candidate.name ?? candidate.id}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-(--color-dark) opacity-75">
                      {new Intl.DateTimeFormat(navigator.language, {
                        dateStyle: "medium",
                      }).format(new Date(candidate.created_at))}
                    </td>

                    {candidate.has_pdf ? (
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
                      <AddNewCVModal
                        candidateToEdit={{
                          id: candidate.id,
                          name: candidate.name ?? "",
                          email: candidate.email ?? "",
                        }}
                        onCreated={() => setReloadKey((prev) => prev + 1)}
                        customTrigger={
                          <button
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 hover:bg-(--color-light)"
                            title="Rediger kandidat"
                          >
                            <img
                              src="src/assets/icons/edit-solid.svg"
                              alt="edit candidate"
                              className="w-5 h-5 opacity-70 hover:opacity-100"
                            />
                          </button>
                        }
                      />

                      <button
                        onClick={() =>
                          handleDelete(
                            candidate.id,
                            candidate.name ?? `Kandidat ${candidate.id}`,
                          )
                        }
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-red-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
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
        </section>

        {/* Footer */}
        <article className="px-1 py-1">
          <p className="text-xs text-(--color-dark) opacity-75">
            Viser {filtered.length} av {data.length} CV-er
          </p>
        </article>
      </div>

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
