import { useFetchScreenings } from "@/hooks/useFetchScreening";
import { Spinner } from "../ui/spinner";
import { Link } from "react-router";
import { formatDate } from "@/utils/formatDate";
import ErrorBox from "../ErrorBox";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "../ui/field";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type CandidateScanningTableProps = {
  candidateId: string;
  candidateName: string;
};

const TableFields = [
  "Alle",
  "Dato",
  "Matchscore",
  "Status",
  "Rangering",
  "Forslag til opplæring",
];

const defaultVisibleFields = Object.fromEntries(
  TableFields.map((field) => [field, true]),
) as Record<string, boolean>;

const STORAGE_KEY = "candidate_table_visible_fields";

function CandidateScanningTable({
  candidateId,
  candidateName,
}: CandidateScanningTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultVisibleFields;
      try {
        const parsed = JSON.parse(saved) as Record<string, boolean>;
        return parsed;
      } catch {
        return defaultVisibleFields;
      }
    },
  );

  // TODO: simplify this - add backend functionality that does this
  const {
    screeningData: allScreenings,
    isLoading,
    isError,
  } = useFetchScreenings();

  // Filter all screenings to show only ones where this candidate participated
  const candidateScreenings = allScreenings
    .filter((s) =>
      s.candidates.some(
        (candidate) => candidate.candidateId === Number(candidateId),
      ),
    )
    .map((s) => ({
      ...s,
      candidateResult: s.candidates.find(
        (c) => c.candidateId === Number(candidateId),
      )!,
    }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleFields));
  });

  console.log(candidateScreenings)

  if (isLoading) {
    return (
      <main className="flex justify-center items-center h-50">
        <Spinner />
      </main>
    );
  }

  if (isError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title="Kan ikke hente tidligere resultater"
          message="Prøv å refresh"
        />
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--color-dark)">
        Tidligere skanninger for {candidateName}
      </h2>

      <article className="w-full">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="flex w-full flex-col gap-3"
        >
          <div className="flex justify-end">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-2 py-1 text-(--color-dark) transition hover:bg-(--color-light)"
              >
                <h3 className="text-sm font-semibold">
                  Hvilke felter skal vises i tabellen
                </h3>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="w-full">
            <FieldGroup className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {TableFields.map((field) => {
                const id = `${field}-checkbox`;

                return (
                  <Field
                    key={field}
                    orientation="horizontal"
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Checkbox
                      id={id}
                      name={id}
                      checked={visibleFields[field]}
                      onCheckedChange={(checked) => {
                        const isChecked = !!checked;

                        if (field === "Alle") {
                          setVisibleFields(
                            Object.fromEntries(
                              TableFields.map((f) => [f, isChecked]),
                            ),
                          );
                        } else {
                          setVisibleFields((prev) => ({
                            ...prev,
                            [field]: isChecked,
                            Alle: false,
                          }));
                        }
                      }}
                      className="cursor-pointer data-[state=checked]:border-(--color-primary) data-[state=checked]:bg-(--color-primary)"
                    />
                    <Label
                      htmlFor={id}
                      className="cursor-pointer text-sm font-medium"
                    >
                      {field}
                    </Label>
                  </Field>
                );
              })}
            </FieldGroup>
          </CollapsibleContent>
        </Collapsible>
      </article>

      <article className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-(--color-primary)">
              <th className="px-4 py-3 text-left text-sm font-semibold text-(--color-dark)">
                Stillingstittel
              </th>

              {visibleFields["Dato"] && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-(--color-dark)">
                  Dato
                </th>
              )}

              {visibleFields["Matchscore"] && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                  Matchscore
                </th>
              )}

              {visibleFields["Status"] && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                  Status
                </th>
              )}

              {visibleFields["Rangering"] && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                  Rangering
                </th>
              )}

              {visibleFields["Forslag til opplæring"] && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                  Forslag til opplæring
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {candidateScreenings.map((screen) => (
              <tr
                key={screen.jobPostId}
                className="border-b border-(--color-primary) hover:bg-(--color-light) transition-colors"
              >
                <td className="px-4 py-3 text-sm text-(--color-dark)">
                  <Link
                    to={`/skanning-historikk/${screen.jobPostId}`}
                    className="cursor-pointer text-(--color-primary) hover:underline"
                  >
                    {screen.title}
                  </Link>
                </td>

                {visibleFields["Dato"] && (
                  <td className="px-4 py-3 text-sm text-(--color-dark)">
                    {formatDate(screen.screenedAt)}
                  </td>
                )}

                {visibleFields["Matchscore"] && (
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        screen.candidateResult.score >= 70
                          ? "bg-green-100 text-green-800"
                          : screen.candidateResult.score >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {Math.round(screen.candidateResult.score)}
                    </span>
                  </td>
                )}

                {visibleFields["Status"] && (
                  <td className="px-4 py-3 min-w-40 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        screen.candidateResult.qualified
                          ? "bg-(--color-light) text-(--color-dark)"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {screen.candidateResult.qualified
                        ? "Kvalifisert"
                        : "Ikke kvalifisert"}
                    </span>
                  </td>
                )}

                {visibleFields["Rangering"] && (
                  <td className="px-4 py-3 text-center text-sm text-(--color-dark)">
                    {screen.candidateResult.rank
                      ? `#${screen.candidateResult.rank} av ${screen.candidates.length}`
                      : "—"}
                  </td>
                )}

                {visibleFields["Forslag til opplæring"] && (
                  <td className="px-4 py-3 text-center text-sm text-(--color-dark) min-w-50">
                    {screen.candidateResult.courseRecommendations.length ? (
                      <ul className="list-disc space-y-2 pl-5 text-sm text-(--color-dark) text-left">
                        {screen.candidateResult.courseRecommendations.map(
                          (recommandation: string) => (
                            <li key={recommandation}>{recommandation}</li>
                          ),
                        )}
                      </ul>
                    ):("")}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
export default CandidateScanningTable;
