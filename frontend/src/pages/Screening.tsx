import ErrorBox from "@/components/ErrorBox";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useFetchScreening } from "@/hooks/useFetchScreening";
import { CheckCircle2, CircleHelp, Clock, FileText, XCircle } from "lucide-react";
import { Link, useParams } from "react-router";

function Screening() {
  const { jobPostId } = useParams<{ jobPostId: string }>();
  const { data, isLoading, isError } = useFetchScreening(jobPostId);

  if (isLoading || !data) {
    return (
      <main className="flex justify-center items-center h-170">
        <Spinner />
      </main>
    );
  }

  if (isError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title={"Kan ikke hente resultatet med id " + jobPostId}
          message={"Prøv å refresh eller sjekke internet tilkoblingen"}
        />
      </section>
    );
  }

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
        <Link
          to="/"
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          Hjem
        </Link>
        <span>›</span>
        <Link
          to="/screening-historikk"
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          Screeninghistorikk
        </Link>
        <span>›</span>
        <span className="text-(--color-dark)">Resultat</span>
      </nav>

      {isLoading && (
        <div className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
          Laster screeningresultat...
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="space-y-4">
          <div className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-semibold text-(--color-dark)">
              {data.title}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-(--color-dark) opacity-75">
              <Clock className="h-4 w-4" />
              <span>{formatDate(data.screenedAt)}</span>
            </div>
          </div>

          {data.candidates.map((candidate) => (
            <div
              key={candidate.candidateId}
              className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-light)">
                    <FileText className="h-5 w-5 text-(--color-primary)" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-(--color-dark)">
                      #{candidate.rank} {candidate.candidateName}
                    </h2>
                  </div>
                </div>
                <span className="rounded-full bg-(--color-light) px-3 py-1 text-xs font-medium text-(--color-dark)">
                  {candidate.qualified ? "Kvalifisert" : "Ikke kvalifisert"}
                </span>
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
                className={`mt-5 grid gap-3 ${
                  candidate.unknowns.length ? "lg:grid-cols-3" : "md:grid-cols-2"
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
                      <li key={`${item}-${index}`} className="flex items-start gap-2 leading-5">
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
                      <li key={`${item}-${index}`} className="flex items-start gap-2 leading-5">
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
                      <h3 className="text-sm font-semibold text-(--color-dark)">Usikkerheter:</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-(--color-dark)">
                      {candidate.unknowns.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex items-start gap-2 leading-5">
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
          ))}
        </div>
      )}
    </main>
  );
}

export default Screening;
