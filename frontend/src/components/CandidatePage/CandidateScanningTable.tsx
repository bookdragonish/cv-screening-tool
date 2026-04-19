import { useFetchScreenings } from "@/hooks/useFetchScreening";
import { Spinner } from "../ui/spinner";
import { Link } from "react-router";
import { formatDate } from "@/utils/dateFormat";
import ErrorBox from "../ErrorBox";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup } from "../ui/field";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

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

function CandidateScanningTable({
  candidateId,
  candidateName,
}: CandidateScanningTableProps) {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    Object.fromEntries(TableFields.map((f) => [f, true])),
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

  console.log(visibleFields);

  return (
    <section className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--color-dark)">
        Tidligere skanninger for {candidateName}
      </h2>

      <article className="mb-6 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium">
            Velg hvilke felter som skal vises i tabellen
          </p>
        </div>

        <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
          {TableFields.map((field) => {
            const id = `${field}-checkbox`;

            return (
              <Field
                key={field}
                orientation="horizontal"
                className="flex items-center gap-3 rounded-lg  px-3 py-2"
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
                        Alle: false, // optional
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
                  <td className="px-4 py-3 text-center">
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
                  <td className="px-4 py-3 text-center text-sm text-(--color-dark)">
                    {screen.candidateResult.courseRecommendations.join(", ")}
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
