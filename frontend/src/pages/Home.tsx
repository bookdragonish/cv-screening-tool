
import { Link } from "react-router";
import { FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React from "react";
import {
  getScreeningHistory,
  type ScreeningDetails,
} from "@/api/fetchScreenings";

function Home() {
  const [screeningActivities, setScreeningActivities] = React.useState<ScreeningDetails[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await getScreeningHistory();
        setScreeningActivities(response);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Dashboard header */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-(--color-dark)">Oversikt</h2>
          <p className="text-(--color-dark) opacity-75">
            Velkommen tilbake! Her er en oversikt over dine CV-screeningaktiviteter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - recent activity */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-(--color-primary) shadow-sm">
              {/* Screening history header */}
              <div className="border-b border-(--color-primary) p-6">
                <h3 className="text-lg font-semibold text-(--color-dark)">
                  Nylig screeningaktivitet
                </h3>
                <p className="mt-1 text-sm text-(--color-dark) opacity-75">
                  Dine siste CV-screeningresultater
                </p>
              </div>
              {/* Screening activity list */}
              <div className="divide-y divide-(--color-primary)">
                {screeningActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.jobPostId}
                    className="flex items-center justify-between p-6 transition-colors hover:bg-(--color-light)/50"
                  >
                    <div>
                      <h4 className="mb-2 font-semibold text-(--color-dark)">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(activity.screenedAt)}</span>
                      </div>
                    </div>
                    <Link
                      to={`/screening-historikk/${activity.jobPostId}`}
                      className="text-sm font-medium text-(--color-primary) transition-opacity hover:opacity-75"
                    >
                      Se resultater
                    </Link>
                  </div>
                ))}
                {isLoading && (
                  <div className="p-6 text-sm text-(--color-dark) opacity-75">
                    Laster screeningaktivitet...
                  </div>
                )}
                {isError && !isLoading && (
                  <div className="p-6 text-sm text-(--color-dark) opacity-75">
                    Kunne ikke hente screeningaktivitet.
                  </div>
                )}
              </div>
              <div className="border-t border-(--color-primary) p-6 text-center">
                <Link
                  to="/screening-historikk"
                  className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) transition-opacity hover:opacity-75"
                >
                  Se hele screeninghistorikken →
                </Link>
              </div>
            </div>
          </div>

          {/* Right column - actions */}
          <div className="space-y-6">
            {/* Start new screening card */}
            <Card className="rounded-lg border-(--color-primary) bg-(--color-primary) p-6 shadow-sm">
              <h3 className="mb-2 text-xl font-semibold text-white">Start ny screening</h3>
              <p className="mb-6 text-sm text-white opacity-90">
                Last opp en stillingsbeskrivelse for å matche kandidater fra CV-databasen
              </p>
              <Button
                asChild
                className="w-full border-2 border-white bg-transparent font-medium text-white transition-all hover:bg-white hover:text-(--color-primary)"
              >
                <Link to="/screening" className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Start screening
                </Link>
              </Button>
            </Card>

            {/* CV database card */}
            <div className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-(--color-light) p-2">
                  <FileText className="h-5 w-5 text-(--color-dark)" />
                </div>
                <div>
                  <h3 className="font-semibold text-(--color-dark)">CV-database</h3>
                  <p className="mt-1 text-sm text-(--color-dark) opacity-75">68 aktive CVer</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full border-(--color-primary) font-medium text-(--color-primary) transition-colors hover:bg-(--color-light)/50"
              >
                <Link to="/cv-database">Administrer CVer</Link>
              </Button>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/cv-database">Administrer CVer</Link>
            </Button>
          </div>
        </div>
    </main>
  );
}

export default Home;
