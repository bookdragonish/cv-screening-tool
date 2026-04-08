import { useFetchScreenings } from "@/hooks/useFetchScreening";
import { Clock } from "lucide-react";
import { Link } from "react-router";

function ScanningHistoryTable() {
  const { screeningData, isLoading, isError } = useFetchScreenings();

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  return (
    <section className="lg:col-span-2 rounded-lg border border-(--color-primary) shadow-sm" aria-label="Nylig screeningaktivitet">

        {/* Screening history header */}
        <header className="border-b border-(--color-primary) p-6 bg-(--color-light) rounded-t-lg ">
          <h3 className="subsection-title text-(--color-dark)">
            Tidligere skanninghistorikk
          </h3>
        </header>

        {/* Screening activity list */}
        <ul className="divide-y divide-(--color-primary)" aria-live="polite">
          {screeningData.slice(0, 5).map((activity) => (
            <Link to={`/screening-historikk/${activity.jobPostId}`}>
              <li
                key={activity.jobPostId}
                className="flex items-center justify-between p-6 transition-colors hover:bg-(--color-light)/50"
              >
                <div>
                  <h4 className="mb-2 font-semibold text-regular text-(--color-dark)">
                    {activity.title}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>{formatDate(activity.screenedAt)}</span>
                  </div>
                </div>

                <p className="rounded-md text-smaller text-(--color-primary) transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2">
                  Se resultater
                </p>
              </li>
            </Link>
          ))}
          {isLoading && (
            <li className="flex justify-center w-full p-6 text-sm text-(--color-dark) opacity-75">
              Laster skanningaktivitet...
            </li>
          )}
          {isError && !isLoading && (
            <li className="flex justify-center w-full p-6 text-sm text-(--color-dark) opacity-75">
              Kunne ikke hente skanningaktivitet.
            </li>
          )}
        </ul>

        <Link
          to="/screening-historikk"
          className=" flex justify-center gap-1 rounded-md text-regular text-(--color-primary) transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-2"
        >
          <footer className="border-t border-(--color-primary) w-full p-6 text-center rounded-b-lg bg-(--color-light)">
            Se hele skanninghistorikken →
          </footer>{" "}
        </Link>
    
    </section>
  );
}
export default ScanningHistoryTable;
