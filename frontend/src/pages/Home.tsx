import { Link } from "react-router";
import { FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFetchScreenings } from "@/hooks/useFetchScreening";
import { useFetchCandidates } from "@/hooks/useFetchCandidates";
import { Spinner } from "@/components/ui/spinner";
import ErrorBox from "@/components/ErrorBox";
import HeaderSection from "@/components/HeaderSection";

function Home() {
  const { screeningData, isLoading, isError } = useFetchScreenings();
  const { data: candidatesData } = useFetchCandidates();

  if (isLoading || !screeningData) {
    return (
      <main id="main-content" className="flex h-170 items-center justify-center" aria-busy="true" aria-live="polite">
        <Spinner />
      </main>
    );
  }

  if (isError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title={"Kan ikke hente screening data"}
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

  const activeCvCount = candidatesData?.length ?? 0;

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-8">
      <HeaderSection
        header={"Oversikt"}
        subsection={
          "Velkommen tilbake! Her er en oversikt over dine CV-skanningsaktiviteter."
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - recent activity */}
        <section className="lg:col-span-2" aria-label="Nylig screeningaktivitet">
          <article className="rounded-lg border border-(--color-primary) shadow-sm">
            {/* Screening history header */}
            <header className="border-b border-(--color-primary) p-6">
              <h2 className="text-lg font-semibold text-(--color-dark)">
                Nylig screeningaktivitet
              </h2>
              <p className="mt-1 text-sm text-(--color-dark) opacity-75">
                Dine siste CV-screeningresultater
              </p>
            </header>
            {/* Screening activity list */}
            <ul className="divide-y divide-(--color-primary)" aria-live="polite">
              {screeningData.slice(0, 5).map((activity) => (
                <li
                  key={activity.jobPostId}
                  className="flex items-center justify-between p-6 transition-colors hover:bg-(--color-light)/50"
                >
                  <div>
                    <h3 className="mb-2 font-semibold text-(--color-dark)">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>{formatDate(activity.screenedAt)}</span>
                    </div>
                  </div>
                  <Link
                    to={`/screening-historikk/${activity.jobPostId}`}
                    className="rounded-md text-sm font-medium text-(--color-primary) transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
                  >
                    Se resultater
                  </Link>
                </li>
              ))}
              {isLoading && (
                <li className="p-6 text-sm text-(--color-dark) opacity-75">
                  Laster screeningaktivitet...
                </li>
              )}
              {isError && !isLoading && (
                <li className="p-6 text-sm text-(--color-dark) opacity-75">
                  Kunne ikke hente screeningaktivitet.
                </li>
              )}
            </ul>
            <footer className="border-t border-(--color-primary) p-6 text-center">
              <Link
                to="/screening-historikk"
                className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-(--color-primary) transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
              >
                Se hele screeninghistorikken →
              </Link>
            </footer>
          </article>
        </section>

        {/* Right column - actions */}
        <aside className="space-y-6" aria-label="Screeninghandlinger">
          {/* Start new screening card */}
          <Card className="rounded-lg border-(--color-primary) bg-(--color-primary) p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Start ny screening
            </h3>
            <p className="mb-6 text-sm text-white opacity-90">
              Last opp en stillingsbeskrivelse for å matche kandidater fra
              CV-databasen
            </p>
            <Button
              asChild
              className="w-full border-2 border-white bg-transparent font-medium text-white transition-all hover:bg-white hover:text-(--color-primary) focus-visible:bg-white focus-visible:text-(--color-primary)"
            >
              <Link
                to="/new-screening"
                className="flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Start screening
              </Link>
            </Button>
          </Card>

          {/* CV database card */}
          <section className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm" aria-label="Kandidatdatabase">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-(--color-light) p-2">
                <FileText className="h-5 w-5 text-(--color-dark)" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-(--color-dark)">
                  Kandidater
                </h3>
                <p className="mt-1 text-sm text-(--color-dark) opacity-75">
                  {activeCvCount} aktive CVer
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full border-(--color-primary) font-medium text-(--color-primary) transition-colors hover:bg-(--color-light)/50"
            >
              <Link to="/kandidater">Administrer CVer</Link>
            </Button>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default Home;
