import { deleteCandidate } from "@/api/fetchCandidates";
import type { Candidate } from "@/types/candidate";
import { AddNewCVModal } from "@/components/addNewCv/AddNewCVModal";


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
      <section className="overflow-hidden rounded-lg border border-(--color-primary) bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left">
            <thead>
              <tr className="border-b border-(--color-primary) bg-(--color-light) text-(--color-primary)">
                <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider">
                  Navn
                </th>
                <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider">
                  Sist endret
                </th>
                <th className="px-5 py-5 text-center text-xs font-semibold uppercase tracking-wider">
                  Pdf
                </th>
                <th className="px-5 py-5 text-right text-xs font-semibold uppercase tracking-wider">
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
                  <td className="px-5 py-7 text-sm font-medium text-(--color-dark) transition-colors duration-150 group-hover:text-(--color-primary)">
                    {candidate.name ?? candidate.id}
                  </td>

                  <td className="px-5 py-7 text-sm text-(--color-primary)">
                    {new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "medium",
                    }).format(new Date(candidate.created_at))}
                  </td>

                  {candidate.has_pdf ? (
                    <td className="py-3 text-center">
                      <button
                        onClick={() => showPreview(candidate.id)}
                        className="cursor-pointer rounded-md p-2 transition-colors duration-150 hover:bg-(--color-light)"
                      >
                        <img
                          src="src/assets/icons/file-pdf-solid.svg"
                          alt="open pdf"
                          className="h-5 w-5 opacity-70 transition-opacity duration-150 hover:opacity-100"
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
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 hover:bg-(--color-light)"
                      title="Delete candidate"
                    >
                      <img
                        src="src/assets/icons/trash-alt-solid.svg"
                        alt="delete candidate"
                        className="h-5 w-5 opacity-70 transition-opacity duration-150 hover:opacity-100"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="px-1 text-xs text-(--color-dark) opacity-75">
        Viser {filteredData.length} av {dataLength} CV-er
      </p>
    </div>
  );
}

export default CandidateTable;
