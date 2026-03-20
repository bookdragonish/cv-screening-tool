import Breadcrumbs from "@/components/Breadcrumbs";
import ErrorBox from "@/components/ErrorBox";
import { Spinner } from "@/components/ui/spinner";
import { useFetchScreening } from "@/hooks/useFetchScreening";
import { Clock } from "lucide-react";
import { useParams } from "react-router";
import CandidateCard from "@/components/CandidateCard";

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
    <main className="mx-auto max-w-7xl min-h-screen px-8 py-6">

      <Breadcrumbs second_site_name={"Skanninghistorikk"} third_site_name={"Resultat"} second_site_link={"/screening-historikk"}/>

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
          <div className="space-y-10">
              <section>
                <h1 className="text-xl font-bold mb-4">
                  Kvalifiserte kandidater
                </h1>
                  
                {data.candidates.some(c=>c.qualified) ? (
                  <div className="grid gap-6">
                    {data.candidates.map((candidate) =>
                      candidate.qualified && (
                        <CandidateCard
                          key={candidate.candidateId}
                          candidate={candidate}
                        />
                      )
                  )}
                  </div>
                ) : (
                  <p className="text-sm text-(--color-dark) opacity-75">
                    Ingen kvalifiserte kandidater
                  </p>
                )}
              </section>
              <section>
                <h1 className="text-xl font-bold mb-4">
                  Ikke kvalifiserte kandidater
                </h1>

                {data.candidates.some(c=>!c.qualified) ? (
                  <div className="grid gap-6">
                    {data.candidates.map((candidate) =>
                      !candidate.qualified && (
                        <CandidateCard
                          key={candidate.candidateId}
                          candidate={candidate}
                        />
                      )
                  )}
                  </div>
                ) : (
                  <p className="text-sm text-(--color-dark) opacity-75">
                    Ingen ikke kvalifiserte kandidater
                  </p>
                )}
              </section>
          </div>
        </div>
      )}
    </main>
  );
}

export default Screening;
