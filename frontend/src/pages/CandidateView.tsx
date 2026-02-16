import { Button } from "@/components/ui/button";
import { useFetchCandidates } from "@/hooks/useFetchCandidates";

function handleDelete(id: number) {
  console.log("Delete");
}

function handleCreate() {
  console.log("Create");
}

function CandidateView() {
  const { data, isError, isLoading } = useFetchCandidates();

  if (isError || !data) {
    return <div>Error.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <h1>Kandidatoversikt</h1>

      <p>rrr</p>

      <Button onClick={handleCreate} className="">
        <img
          src="src/assets/icons/plus-solid.svg"
          alt="delete candidate"
          width="20px"
          height="20px"
        />
        Legg til ny CV
      </Button>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-500 text-sm">
            <th className="py-3 font-medium">Navn</th>
            <th className="py-3 font-medium">Sist endret</th>
            <th className="py-3 font-medium">Opplastet CV</th>
            <th className="py-3 font-medium">Slett</th>
          </tr>
        </thead>

        <tbody>
          {data.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-gray-800 transition">
              <td className="py-3">
                {candidate.name ? candidate.name : candidate.id}
              </td>

              <td className="py-3">
                {new Intl.DateTimeFormat(navigator.language, {
                  dateStyle: "medium",
                }).format(new Date(candidate.created_at))}
              </td>

              <td className="py-3">{candidate.cv_pdf}</td>

              <td className="py-3">
                <button onClick={() => handleDelete(candidate.id)}>
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
    </main>
  );
}
export default CandidateView;
