import type { RankedCandidate } from "@/types/screening";

function CandidateSidbar({ candidates }: { candidates: RankedCandidate[] }) {
  return (
    <aside className="lg:sticky lg:top-10 lg:h-[90vh] lg:flex lg:flex-col lg:overflow-scroll sm:grid sm:grid-cols-2 sm:m-4">
      <h2 className="my-4 text-xl font-bold sm:col-span-2">Oversikt</h2>

      {candidates.some((c) => c.qualified) ? (
        <article className="flex flex-col">
          <h3 className="subsection-title sm:grid-">Kvalifiserte Kandidater</h3>
          {candidates.map((candidate) => (
            <a
              key={candidate.candidateId}
              href={`#${candidate.candidateId}`}
              className=" px-3 py-2 text-sm opacity-70 hover:opacity-100 uppercase"
            >
              {candidate.candidateName}
            </a>
          ))}
        </article>
      ) : (
        <></>
      )}

     

      {candidates.some((c) => !c.qualified) ? (
        <article className="flex flex-col">
          <h3 className="subsection-title">Ikke-kvalifiserte Kandidater</h3>
          {candidates.map((candidate) => (
            <a
              key={candidate.candidateId}
              href={`#${candidate.candidateId}`}
              className=" px-3 py-2 text-sm opacity-70 hover:opacity-100 uppercase"
            >
              {candidate.candidateName}
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
