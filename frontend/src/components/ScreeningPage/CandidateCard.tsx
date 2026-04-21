import { CheckCircle2, CircleHelp, FileText, XCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import type { RankedCandidate } from "@/types/screening";
import { Badge } from "../ui/badge";
import { Link } from "react-router";

type CandidateCardProps = {
  candidate: RankedCandidate;
  id: number;
};

function CandidateCard({ candidate, id }: CandidateCardProps) {
  console.log(candidate)
  return (
    <div
      id={id + ""}
      className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-light)">
            <FileText className="h-5 w-5 text-(--color-primary)" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-(--color-dark)">
              {candidate.qualified && <>#{candidate.rank}</>}{" "}
              <Link
                to={`/kandidater/${id}`}
                className="hover:underline"
              >
                {candidate.candidateName}
              </Link>
            </h2>
          </div>
        </div>

        {candidate.aml46 ? <Badge variant="aml" className='px-3 py-1 text-sm'>{"AML §4.6"}</Badge> : ""}
        {candidate.aml47 ? <Badge variant="aml" className='px-3 py-1 text-sm'>{"AML §4.7"}</Badge> : ""}
      </div>

      <article className="flex justify-between">
        <p className="mt-1 text-sm text-(--color-dark) opacity-75">
          Matchscore:
        </p>
        <p className="mt-1 text-sm text-(--color-dark) opacity-75">
          {" "}
          {Math.round(candidate.score)}%
        </p>
      </article>
      <Progress value={Math.round(candidate.score)} />

      {candidate.summary && (
        <p className="mt-4 text-sm text-(--color-dark) opacity-90">
          {candidate.summary}
        </p>
      )}

      <div
        className={`mt-5 grid gap-3 ${candidate.unknowns.length ? "lg:grid-cols-3" : "md:grid-cols-2"
          }`}
      >
        <section className="py-1">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-(--color-dark)">
              Oppnådde kvalifikasjoner:
            </h3>
          </div>
          {(() => {
            const fallbackMet = "Ingen kvalifikasjoner oppnådd.";
            const metItems = candidate.qualificationsMet.length
              ? candidate.qualificationsMet
              : [fallbackMet];

            return (
              <ul className="space-y-2 text-sm text-(--color-dark)">
                {metItems.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex items-start gap-2 leading-5"
                  >
                    {item !== fallbackMet ? (
                      <CheckCircle2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: "var(--status-qual-met)" }}
                      />
                    ) : null}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        <section className="py-1">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-(--color-dark)">
              Manglende kvalifikasjoner:
            </h3>
          </div>
          {(() => {
            const fallbackMissing = "Ingen manglende kvalifikasjoner";
            const missingItems = candidate.qualificationsMissing.length
              ? candidate.qualificationsMissing
              : [fallbackMissing];

            return (
              <ul className="space-y-2 text-sm text-(--color-dark)">
                {missingItems.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex items-start gap-2 leading-5"
                  >
                    {item !== fallbackMissing ? (
                      <XCircle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: "var(--status-qual-not-met)" }}
                      />
                    ) : null}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        {candidate.unknowns.length ? (
          <section className="py-1">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-(--color-dark)">
                Usikkerheter:
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-(--color-dark)">
              {candidate.unknowns.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 leading-5"
                >
                  <CircleHelp
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: "var(--status-unknown)" }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default CandidateCard;
