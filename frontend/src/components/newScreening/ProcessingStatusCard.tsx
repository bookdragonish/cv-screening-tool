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
    <Card className="mt-6 gap-0 border-slate-200 bg-white py-0">
      <CardContent className="p-6">
        {!isProcessingComplete ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center" role="status" aria-live="polite">
            <LoaderCircleIcon className="h-14 w-14 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-6 text-3xl font-semibold text-slate-900">Analyserer stillingskrav</p>
            <p className="mt-2 text-base text-slate-500">
              Matcher kandidater til jobbeskrivelsen...
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center" role="status" aria-live="polite">
            <CheckCircle2Icon className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" />
            <p className="mt-4 text-2xl font-semibold text-slate-900">Behandling fullført</p>
            <p className="mt-2 text-base text-slate-500">
              Kandidatmatchene er klare. Velg hva du vil gjøre videre.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-100" onClick={onStartNew}>
                Start ny skanning
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/80">
                <Link to={resultsHref}>Se resultater</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );


/*   return (
    <Card className="mt-6 gap-0 border-slate-200 bg-white py-0">
      <CardContent className="p-6">
        {!isProcessingComplete ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <LoaderCircleIcon className="h-14 w-14 animate-spin text-primary" />
            <p className="mt-6 text-3xl font-semibold text-slate-900">Analyserer stillingskrav</p>
            <p className="mt-2 text-base text-slate-500">
              Matcher kandidater fra CV-databasen...
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <CheckCircle2Icon className="mx-auto h-14 w-14 text-emerald-600" />
            <p className="mt-4 text-2xl font-semibold text-slate-900">Behandling fullført</p>
            <p className="mt-2 text-base text-slate-500">
              Kandidatmatchene er klare. Velg hva du vil gjøre videre.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" className="border-slate-300 bg-white hover:bg-slate-500" onClick={onStartNew}>
                Start ny screening
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/80">
                <Link to={resultsHref}>Gå til resultater</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  ); */
}

export default ProcessingStatusCard;
