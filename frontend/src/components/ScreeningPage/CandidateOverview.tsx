import type { RankedCandidate } from "@/types/screening";
import CandidateCard from "./CandidateCard";

function CandidateOverview({ candidates }: { candidates: RankedCandidate[] }) {
  return (
    <section className="lg:col-span-2">
      <article>
        <h2 className="m-4 text-xl font-bold">Kvalifiserte kandidater</h2>

        {candidates.some((c) => c.qualified) ? (
          <div className="grid gap-6">
            {candidates.map(
              (candidate) =>
                candidate.qualified && (
                  <CandidateCard
                    id={candidate.candidateId}
                    key={candidate.candidateId}
                    candidate={candidate}
                  />
                ),
            )}
          </div>
        ) : (
          <p className="text-sm text-(--color-dark) opacity-75 mx-10">
            Ingen kvalifiserte kandidater
          </p>
        )}
      </article>

      <article>
        <h2 className="m-4 text-xl font-bold">Ikke kvalifiserte kandidater</h2>

        {candidates.some((c) => !c.qualified) ? (
          <div className="grid gap-6">
            {candidates.map(
              (candidate) =>
                !candidate.qualified && (
                  <CandidateCard
                    id={candidate.candidateId}
                    key={candidate.candidateId}
                    candidate={candidate}
                  />
                ),
            )}
          </div>
        ) : (
          <p className="text-sm text-(--color-dark) opacity-75 mx-10">
            Ingen ikke-kvalifiserte kandidater
          </p>
        )}
      </article>

      <footer>
        <p className="px-1 text-smaller text-(--color-dark) opacity-75">
          Viser {candidates.length} kandidater
        </p>
      </footer>
    </section>
  );
}
export default CandidateOverview;
