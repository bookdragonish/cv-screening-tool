import { deleteCandidate } from "@/api/fetchCandidates";
import type { Candidate } from "@/types/candidate";
import { AddNewCVModal } from "@/components/AddNewCv/AddNewCVModal";
import { Eye, Pencil, Trash2 } from "lucide-react";

type CandidateTableProps = {
  filteredData: Candidate[];
  setPreviewId: (value: number) => void;
  setReloadKey: React.Dispatch<React.SetStateAction<number>>;
  dataLength: number;
};

function CandidateTable({
  filteredData,
  setPreviewId,
  dataLength,
  setReloadKey,
}: CandidateTableProps) {
  function showPreview(id: number) {
    setPreviewId(id);
  }

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
    <div className="space-y-3">
      <section
        className="overflow-hidden rounded-lg border border-(--color-primary) bg-white shadow-sm"
        aria-label="Kandidattabell"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left">
            <caption className="sr-only">
              Liste over kandidater med dato for siste endring,
              PDF-forhåndsvisning, redigering og sletting av kandidater.
            </caption>
            <thead>
              <tr className="border-b border-(--color-primary) bg-(--color-light) text-(--color-primary)">
                <th
                  scope="col"
                  className="p-3 subsection-title uppercase tracking-wider"
                >
                  Navn
                </th>
                <th
                  scope="col"
                  className="p-3 subsection-title uppercase tracking-wider"
                >
                  Sist endret
                </th>
                <th
                  scope="col"
                  className="p-3 subsection-title uppercase text-center tracking-wider"
                >
                  Pdf
                </th>
                <th
                  scope="col"
                  className="p-3 subsection-title text-right uppercase tracking-wider"
                >
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-light)">
              {filteredData.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="group transition-colors duration-150 hover:bg-(--color-light)/70"
                >
                  <td className="px-5 py-7 text-regular text-(--color-dark) transition-colors duration-150 group-hover:text-(--color-primary)">
                    {candidate.name ?? candidate.id}
                  </td>

                  <td className="px-5 py-7 text-regular text-(--color-primary)">
                    {new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "medium",
                    }).format(new Date(candidate.created_at))}
                  </td>

                  {candidate.has_pdf ? (
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() => showPreview(candidate.id)}
                        className="cursor-pointer rounded-md p-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
                        aria-label={`Forhandsvis PDF for ${candidate.name ?? `kandidat ${candidate.id}`}`}
                      >
                        <Eye
                          className="h-6 w-6 opacity-70 hover:opacity-100"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  ) : (
                    <td className="text-center text-sm text-slate-500">-</td>
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
                          type="button"
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
                          title="Rediger kandidat"
                          aria-label={`Rediger kandidat ${candidate.name ?? candidate.id}`}
                        >
                          <Pencil
                            className="h-5 w-5 opacity-70 hover:opacity-100"
                            aria-hidden="true"
                          />
                        </button>
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          candidate.id,
                          candidate.name ?? `Kandidat ${candidate.id}`,
                        )
                      }
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
                      title="Slett kandidat"
                      aria-label={`Slett kandidat ${candidate.name ?? candidate.id}`}
                    >
                      <Trash2
                        className="h-5 w-5 opacity-70 hover:opacity-100"
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        <p className="px-1 text-smaller text-(--color-dark) opacity-75">
          Viser {filteredData.length} av {dataLength} kandidater
        </p>
      </footer>
    </div>
  );
}

export default CandidateTable;
