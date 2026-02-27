
import { Spinner } from "@/components/ui/spinner";
import { useFetchScreening } from "@/hooks/useFetchScreening";
import { Clock, FileText } from "lucide-react";
import { Link, useParams } from "react-router";

function Screening() {
  const { jobPostId } = useParams<{ jobPostId: string }>();
  const { data, isLoading, isError} = useFetchScreening(jobPostId);

  if (isLoading || !data) {
    return (
      <main className="flex justify-center items-center h-170">
        <Spinner />
      </main>
    );
  }

  if(isError){
    return(<div>Error</div>)
  }

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));

  return (
    <main className="min-h-screen px-8 py-6">
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

      {!isLoading && (isError || !data) && (
        <div className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-(--color-dark)">
            Fant ikke screeningresultatet
          </h1>
          <Link
            to="/screening-historikk"
            className="mt-4 inline-block rounded-lg bg-(--color-primary) px-4 py-2 font-medium text-white"
          >
            Tilbake
          </Link>
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
                    <p className="mt-1 text-sm text-(--color-dark) opacity-75">
                      Matchscore: {Math.round(candidate.score)}%
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-(--color-light) px-3 py-1 text-xs font-medium text-(--color-dark)">
                  {candidate.qualified ? "Kvalifisert" : "Ikke kvalifisert"}
                </span>
              </div>

              {candidate.summary && (
                <p className="mt-4 text-sm text-(--color-dark) opacity-90">
                  {candidate.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Screening;
