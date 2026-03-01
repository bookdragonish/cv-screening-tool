import { Link } from "react-router";
import { Clock, FileText, Search } from "lucide-react";
import React from "react";
import { useFetchScreenings } from "@/hooks/useFetchScreening";
import { Spinner } from "@/components/ui/spinner";
import ErrorBox from "@/components/ErrorBox";

function ScreeningHistory() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { screeningData, isLoading, isError } = useFetchScreenings();

  if (isLoading || !screeningData) {
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
    <main className="min-h-screen px-8 py-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
        <Link
          to="/"
          className="cursor-pointer transition-opacity hover:opacity-75"
        >
          Hjem
        </Link>
        <span>›</span>
        <span className="text-(--color-dark)">Screeninghistorikk</span>
      </nav>

      <div className="min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-(--color-dark)">
            Screeninghistorikk
          </h1>
          <p className="mt-2 text-(--color-dark) opacity-75">
            Få oversikt over tidligere CV-screeningsresultater
          </p>
        </div>

        {isLoading && (
          <div className="mb-6 rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
            Laster screeninghistorikk...
          </div>
        )}

        {isError && (
          <div className="mb-6 rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
            Kunne ikke hente screeninghistorikk.
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-(--color-dark) opacity-50" />
            <input
              type="text"
              placeholder="Søk etter jobbtittel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-(--color-primary) py-3 pr-4 pl-10 text-(--color-dark) outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.map((screening) => (
            <div
              key={screening.jobPostId}
              className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm transition-colors hover:bg-(--color-light)/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-light)">
                      <FileText className="h-5 w-5 text-(--color-primary)" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-(--color-dark)">
                        {screening.title}
                      </h3>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-(--color-dark) opacity-75">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(screening.screenedAt)}</span>
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-sm font-medium text-(--color-dark)">
                          Top 3 kandidater:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {screening.candidates
                            .slice(0, 3)
                            .map((candidate, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-(--color-light) px-3 py-1 text-xs font-medium text-(--color-dark)"
                              >
                                #{index + 1} {candidate.candidateName} (
                                {Math.round(candidate.score)}%)
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/screening-historikk/${screening.jobPostId}`}
                  className="ml-4 whitespace-nowrap rounded-lg bg-(--color-primary) px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
                >
                  Se resultater
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filteredHistory.length === 0 && (
          <div className="rounded-lg border border-(--color-primary) bg-white  p-12 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-16 w-16 text-(--color-primary) opacity-60" />
            <h3 className="mb-2 text-lg font-semibold text-(--color-dark)">
              Ingen screeningresultater funnet for søket ditt
            </h3>
            <p className="text-sm text-(--color-dark) opacity-75">
              Prøv å justere søket ditt
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
export default ScreeningHistory;
