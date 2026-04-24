import type { RankedCandidate } from "@/types/screening";
function CandidateSidbar({ candidates }: { candidates: RankedCandidate[] }) {
  return (
    <aside className="lg:sticky lg:top-10 lg:h-[90vh] lg:flex lg:flex-col lg:overflow-auto sm:grid sm:grid-cols-2 sm:m-4">
      <h2 className="my-4 text-xl font-bold sm:col-span-2">Oversikt</h2>

      {candidates.some((c) => c.qualified) ? (
        <article className="flex flex-col">
          <h3 className="subsection-title sm:grid-">Kvalifiserte kandidater</h3>
          {candidates .filter((candidate) => candidate.qualified).map((candidate) => (
            <a
              key={candidate.candidateId}
              href={`#${candidate.candidateId}`}
              className=" px-3 py-2 flex text-sm opacity-70 hover:opacity-100"
            >
              <p>{candidate.candidateName}</p> 
              {(candidate.aml46 || candidate.aml47) ? (<p className="mx-1">§</p>) : ("")} 
            </a>
          ))}
        </article>
      ) : (
        <></>
      )}

     

      {candidates.some((c) => !c.qualified) ? (
        <article className="flex flex-col">
          <h3 className="subsection-title">Ikke-kvalifiserte kandidater</h3>
          {candidates .filter((candidate) => !candidate.qualified).map((candidate) => (
            <a
              key={candidate.candidateId}
              href={`#${candidate.candidateId}`}
              className=" px-3 py-2 flex text-sm opacity-70 hover:opacity-100"
            >
              <p>{candidate.candidateName}</p> 
              {(candidate.aml46 || candidate.aml47) ? (<p className="mx-1">§</p>) : ("")} 
            </a>
          ))}
        </article>
      ) : (
        <></>
      )}

 

      
    </aside>
  );
}
export default CandidateSidbar;
