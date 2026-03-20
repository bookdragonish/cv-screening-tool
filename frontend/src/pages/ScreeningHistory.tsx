import { Link } from "react-router";
import { Clock, FileText } from "lucide-react";
import React from "react";
import { useFetchScreenings } from "@/hooks/useFetchScreening";
import { Spinner } from "@/components/ui/spinner";
import ErrorBox from "@/components/ErrorBox";
import Breadcrumbs from "@/components/Breadcrumbs";
import Searchbar from "@/components/Searchbar";
import HeaderSection from "@/components/HeaderSection";

function ScreeningHistory() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { screeningData, isLoading, isError } = useFetchScreenings();

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
          title={"Kan ikke hente screeninghistorikk"}
          message={"Prøv å refresh eller sjekke internet tilkoblingen"}
        />
      </section>
    );
  }

  const filteredHistory = screeningData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));

  return (
    <main id="main-content" className="mx-auto max-w-7xl min-h-screen px-8 py-6">
      <Breadcrumbs second_site_name={"Skanninghistorikk"} />

      <section className="min-h-screen" aria-label="Skanninghistorikk">
        <HeaderSection
          header={"Skanninghistorikk"}
          subsection={
            "Oversikt over tidligere CV-skanninger. Resultatene er kun veiledende og kan inneholde unøyaktigheter."
          }
        />

        {isLoading && (
          <div className="mb-6 rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
            Laster skanninghistorikk...
          </div>
        )}

        {isError && (
          <ErrorBox
            title={"Kunne ikke hente skanninghistorikk."}
            message={"Prøv igjen senere"}
          />
        )}

        <Searchbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchAttribute={"jobbtittel"}
        />

        <section className="space-y-4" aria-live="polite">
          {filteredHistory.map((screening) => (
            <article
              key={screening.jobPostId}
              className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm transition-colors hover:bg-(--color-light)/40"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-light)">
                      <FileText className="h-5 w-5 text-(--color-primary)" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-(--color-dark)">
                        {screening.title}
                      </h3>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-(--color-dark) opacity-75">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          <span>{formatDate(screening.screenedAt)}</span>
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-(--color-dark)">
                          Top 3 kandidater:
                        </p>
                        {screening.candidates.some(c => c.qualified) ? (
                        <div className="flex flex-wrap gap-2">
                          {screening.candidates
                            .filter(c => c.qualified)
                            .slice(0, 3)
                            .map((candidate, index) => (
                              
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-(--color-light) px-3 py-1 text-xs font-medium text-(--color-dark)"
                              >
                                #{index + 1} {candidate.candidateName} ({Math.round(candidate.score)}%)
                              </span>
                            ))}
                        </div>
                        ) : (
                          <p className="text-sm text-(--color-dark) opacity-75">
                            Ingen kvalifiserte kandidater
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/screening-historikk/${screening.jobPostId}`}
                  className="ml-4 whitespace-nowrap rounded-lg bg-(--color-primary) px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
                >
                  Se resultater
                </Link>
              </div>
            </article>
          ))}
        </section>

        {!isLoading && filteredHistory.length === 0 && (
          <section className="rounded-lg border border-(--color-primary) bg-white p-12 text-center shadow-sm" aria-live="polite">
            <FileText className="mx-auto mb-4 h-16 w-16 text-(--color-primary) opacity-60" aria-hidden="true" />
            <h3 className="mb-2 text-lg font-semibold text-(--color-dark)">
              Ingen screeningresultater funnet for søket ditt
            </h3>
            <p className="text-sm text-(--color-dark) opacity-75">
              Prøv å justere søket ditt
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
export default ScreeningHistory;
