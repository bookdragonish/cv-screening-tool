import { deleteCandidate } from "@/api/fetchCandidates";
import type { Candidate } from "@/types/candidate";

function handleEdit(id: number) {
  console.log("Edit", id);
}

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
    <section className="bg-white --color-primary rounded-xl border border-(--color-primary) overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-130 text-left">
          <thead>
            <tr className="border-b border-(--color-primary)">
              <th className="px-5 py-5 text-xs mb-2 font-semibold uppercase tracking-wider">
                Navn
              </th>
              <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider">
                Sist endret
              </th>
              <th className="px-5 py-5 text-xs font-semibold text-center uppercase tracking-wider">
                Pdf
              </th>
              <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider text-right">
                Handlinger
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.map((candidate) => (
              <tr
                key={candidate.id}
                className="hover:bg-gray-50 transition-colors duration-100"
              >
                <td className="px-5 py-7 text-sm font-medium text-gray-800">
                  {candidate.name ?? candidate.id}
                </td>

                <td className="px-5 py-7 text-sm text-gray-500">
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
      <article className="px-5 py-5 border-t border-(--color-primary) bg-white">
        <p className="text-xs text-gray-400">
          Viser {filteredData.length} av {dataLength} CV-er
        </p>
      </article>
    </section>
  );
}
export default CandidateTable;
