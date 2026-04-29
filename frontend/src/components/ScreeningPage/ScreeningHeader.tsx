import { formatCapitalizeFirstLetter } from "@/utils/formatCapitalizeFirstLetter";
import { formatDate } from "@/utils/formatDate";
import { Clock } from "lucide-react";

type ScreeningHeaderProps = {
  title: string;
  must_have_qualifications: string[];
  nice_to_have_qualifications: string[];
  screenedAt: string;
};

function ScreeningHeader({
  title,
  must_have_qualifications,
  nice_to_have_qualifications,
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
           <h2 className="mb-3 text-sm font-semibold text-(--color-dark)">
              Harde kvalifikasjoner:
            </h2>
           <ul className="list-disc space-y-2 pl-5 text-sm text-(--color-dark)">
            {must_have_qualifications?.map((qualification, index) => (
              <li key={index}>{formatCapitalizeFirstLetter(qualification)}</li>
            ))}
          </ul>
        </article>

        <article>
           <h2 className="mb-3 text-sm font-semibold text-(--color-dark)">
              Ønskede kvalifikasjoner:
            </h2>

           <ul className="list-disc space-y-2 pl-5 text-sm text-(--color-dark)">
            {nice_to_have_qualifications?.map((qualification, index) => (
              <li key={index}>{formatCapitalizeFirstLetter(qualification)}</li>
            ))}
          </ul>
        </article>
      </section>
    </header>
  );
}
export default ScreeningHeader;
