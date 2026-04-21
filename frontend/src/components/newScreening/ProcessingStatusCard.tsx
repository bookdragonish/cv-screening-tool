import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ProcessingStatusCardProps = {
  isProcessingComplete: boolean;
  resultsHref: string;
  onStartNew: () => void;
};

function ProcessingStatusCard({
  isProcessingComplete,
  resultsHref,
  onStartNew,
}: ProcessingStatusCardProps) {
  return (
    <Card className="mt-6 gap-0 px-2 border border-(--color-primary) shadow-sm bg-white">
      <CardContent className="p-6">
        {!isProcessingComplete ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center" role="status" aria-live="polite">
            <LoaderCircleIcon className="h-14 w-14 animate-spin text-primary" aria-hidden="true" />
            <h1 className="mt-6 text-3xl font-semibold text-slate-900">Analyserer stillingskrav</h1>
            <p className="mt-2 text-base text-slate-500">
              Matcher kandidater til jobbeskrivelsen...
            </p>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-(--color-primary) bg-(--color-light)/10 px-6 py-12 text-center" role="status" aria-live="polite">
            <CheckCircle2Icon className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">Behandling fullført</h1>
            <p className="mt-2 text-base text-slate-500">
              Kandidatmatchene er klare. Velg hva du vil gjøre videre.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" className="w-38 hover-dark-button border-2 border-(--color-primary) p-2 cursor-pointer" onClick={onStartNew}>
                Start ny skanning
              </Button>
              <Button asChild variant="outline" className="w-38 hover-dark-button border-2 border-(--color-primary) p-2 cursor-pointer">
                <Link to={resultsHref}>Se resultater</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProcessingStatusCard;
