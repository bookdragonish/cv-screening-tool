import { formatDate } from "@/utils/dateFormat";
import { Clock } from "lucide-react";

type ScreeningHeaderProps = {
  title: string;
  hardQualifications: string[];
  softQualifications: string[];
  screenedAt: string;
};

function ScreeningHeader({
  title,
  hardQualifications,
  softQualifications,
  screenedAt,
}: ScreeningHeaderProps) {
  
  return (
    <header className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold text-(--color-dark)">{title}</h1>

      <section className="mt-3 flex items-center gap-2 text-sm text-(--color-dark) opacity-75">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span>{formatDate(screenedAt)}</span>
      </section>

      <section className="grid grid-cols-2 gap-x-10 pt-3">
        <article>
           <h3 className="mb-3 text-sm font-semibold text-(--color-dark)">
              Harde kvalifikasjoner:
            </h3>
           <ul className="list-disc space-y-2 pl-5 text-sm text-(--color-dark)">
            {hardQualifications?.map((qualification, index) => (
              <li key={index}>{qualification}</li>
            ))}
          </ul>
        </article>

        <article>
           <h3 className="mb-3 text-sm font-semibold text-(--color-dark)">
              Ønskede kvalifikasjoner:
            </h3>

           <ul className="list-disc space-y-2 pl-5 text-sm text-(--color-dark)">
            {softQualifications?.map((qualification, index) => (
              <li key={index}>{qualification}</li>
            ))}
          </ul>
        </article>
      </section>
    </header>
  );
}
export default ScreeningHeader;
