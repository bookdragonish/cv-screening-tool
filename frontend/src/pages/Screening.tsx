import Breadcrumbs from "@/components/Breadcrumbs";
import ErrorBox from "@/components/ErrorBox";
import { Spinner } from "@/components/ui/spinner";
import { useFetchScreening } from "@/hooks/useFetchScreening";
import { Clock } from "lucide-react";
import { useParams } from "react-router";
import CandidateSidbar from "@/components/ScreeningPage/CandidateSidebar";
import CandidateOverview from "@/components/ScreeningPage/CandidateOverview";

function Screening() {
  const { jobPostId } = useParams<{ jobPostId: string }>();
  const { data, isLoading, isError } = useFetchScreening(jobPostId);

  if (isError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title={"Kan ikke hente resultatet med id " + jobPostId}
          message={"Prøv å refresh eller sjekke internett-tilkoblingen"}
        />
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <main
        id="main-content"
        className="flex h-170 items-center justify-center"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner />
      </main>
    );
  }

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl min-h-screen px-8 py-6"
    >
      <Breadcrumbs
        second_site_name={"Skanninghistorikk"}
        third_site_name={"Resultat"}
        second_site_link={"/screening-historikk"}
      />

      <header className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-(--color-dark)">
          {data.title}
        </h1>
        <p> {data.aiJobDescription}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-(--color-dark) opacity-75">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>{formatDate(data.screenedAt)}</span>
        </div>
      </header>

      <div id="result-container" className="grid grid-cols-1 gap-6 lg:grid-cols-3">

      <CandidateSidbar candidates={data.candidates} />
      
      <CandidateOverview candidates={data.candidates} />
      </div>
    </main>
  );
}

export default Screening;
