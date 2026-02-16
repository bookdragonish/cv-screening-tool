import { Button } from "@/components/ui/button";
import { useFetchCandidates } from "@/hooks/useFetchCandidates";

  function handleDelete() {
    console.log("Delete")
  }

  function handleCreate(){
    console.log("Create")
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

      <Button onClick={handleCreate}> <img src="src/assets/icons/plus-solid.svg" alt="delete candidate" width="20px" height="20px" />Legg til ny CV</Button>

      {data.map((candidate) => (
        <article key={candidate.id} className="flex">

          {candidate.name ? <p>{candidate.name}</p> : <p>{candidate.id}</p>}
          <p>{candidate.created_at}</p>

          <p>{candidate.cv_pdf}</p>

          <span onClick={handleDelete}>
            <img src="src/assets/icons/trash-alt-solid.svg" alt="delete candidate" width="50px" height="50px" />
          </span>
        </article>
      ))}
    </main>
  );
}
export default CandidateView;
