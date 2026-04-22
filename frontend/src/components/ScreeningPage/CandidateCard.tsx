import {
  CheckCircle2,
  CircleHelp,
  FileText,
  Info,
  XCircle,
} from "lucide-react";
import { Progress } from "../ui/progress";
import type { RankedCandidate } from "@/types/screening";
import { Badge } from "../ui/badge";
import { Link } from "react-router";
import HoverExplanationCard from "./HoverExplanationCard";
import { formatAnsiennitet } from "@/utils/formatAnsiennitet";
import { formatCapitalizeFirstLetter } from "@/utils/formatCapitalizeFirstLetter";

type CandidateCardProps = {
  candidate: RankedCandidate;
  id: number;
  setPreviewId: (id: number) => void;
};

function CandidateCard({ candidate, id, setPreviewId }: CandidateCardProps) {
  return (
    <div
      id={id + ""}
      className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-light)">
            {candidate.hasPdf ? (
              <button
                type="button"
                onClick={() => setPreviewId(candidate.candidateId)}
                className="cursor-pointer rounded-md p-2"
                aria-label={`Forhåndsvis PDF for ${candidate.candidateName}`}
                title="Forhåndsvis PDF"
              >
                <FileText className="h-5 w-5 text-(--color-primary)" />
              </button>
            ) : (
              <FileText className="h-5 w-5 text-(--color-primary) opacity-30" />
            )} 
          </div>
          <div>
            <h2 className="text-lg font-semibold text-(--color-dark)">
              {candidate.qualified && <>#{candidate.rank}</>}{" "}
              <Link to={`/kandidater/${id}`} className="hover:underline">
                {candidate.candidateName}
              </Link>
            </h2>
          </div>
            <p className="text-sm text-(--color-dark) mt-1">
              {!candidate.ansiennitet ? (
                ""
              ) : (
                <>
                  Ansiennitet: {formatAnsiennitet(candidate.ansiennitet)}
                </>
              )}
            </p>
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
      <Progress value={Math.round(candidate.score)} aria-label={`Matchscore for ${candidate.candidateName}`} />

      {candidate.summary && (
        <p className="mt-4 text-sm text-(--color-dark) opacity-90">
          {candidate.summary}
        </p>
      )}

      <div
        className={`mt-5 grid gap-3 ${
          candidate.unknowns.length + candidate.courseRecommendations.length
            ? "lg:grid-cols-3"
            : "md:grid-cols-2"
        }`}
      >
        <section className="py-1">
          <h3 className="mb-3 text-sm font-semibold text-(--color-dark)">
            Oppnådde kvalifikasjoner:
          </h3>

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
                      <HoverExplanationCard
                        title="Kvalifikasjon oppnådd"
                        description="Dette punktet mener KI at kandidaten har oppfylt."
                      >
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: "var(--status-qual-met)" }}
                        />
                      </HoverExplanationCard>
                    ) : null}
                    <span>{formatCapitalizeFirstLetter(item)}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        <section className="py-1">
          <h3 className="mb-3 text-sm font-semibold text-(--color-dark)">
            Manglende kvalifikasjoner:
          </h3>

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
                      <HoverExplanationCard
                        title="Kvalifikasjon mangler."
                        description="I følge KI mangler kandidaten kunnskap eller erfaring som er spesifisert i jobb beskrivelsen."
                      >
                        <XCircle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: "var(--status-qual-not-met)" }}
                        />
                      </HoverExplanationCard>
                    ) : null}
                    <span>{formatCapitalizeFirstLetter(item)}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        {candidate.unknowns.length + candidate.courseRecommendations.length ? (
          <section className="py-1">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-(--color-dark)">
                Må sees gjennom:
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-(--color-dark)">
              {candidate.unknowns.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 leading-5"
                >
                  <HoverExplanationCard
                    title="Usikkerhet"
                    description="Dette punktet klarer ikke KI klassifisere, og må derfor vurderes av HR-personell."
                  >
                    <CircleHelp
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: "var(--status-unknown)" }}
                    />
                  </HoverExplanationCard>
                  <span>{formatCapitalizeFirstLetter(item)}</span>
                </li>
              ))}

              {candidate.courseRecommendations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 leading-5"
                >
                  <HoverExplanationCard
                    title="Forslag til opplæring."
                    description="Dette er et krav KI mener at kandidaten mangler, men som kan kurses innen rimelig tid."                  >
                    <Info
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: "var(--status-course)" }}
                    />
                  </HoverExplanationCard>
                  <span>{formatCapitalizeFirstLetter(item)}</span>
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
