import { FileTextIcon } from "lucide-react";

import CandidateResultCard from "@/components/newScreening/CandidateResultCard";
import ScreeningBreadcrumbs from "@/components/newScreening/ScreeningBreadcrumbs";
import type { ScreeningCandidate } from "@/components/newScreening/newScreeningLib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ScreeningResultsViewProps = {
  jobTitle: string;
  analyzedAt: string;
  candidates: ScreeningCandidate[];
  candidateBaseHref: string;
};

function ScreeningResultsView({
  jobTitle,
  analyzedAt,
  candidates,
  candidateBaseHref,
}: ScreeningResultsViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <ScreeningBreadcrumbs current="results" canGoToResults={true} />

      <Card className="gap-0 border-slate-200 bg-white py-0">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{jobTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {analyzedAt} &nbsp;&nbsp; {candidates.length} kandidater analysert
            </p>
          </div>

          <Button variant="outline" className="border-slate-300 bg-primary hover:bg-primary/80 text-white">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Vis stillingsbeskrivelse
          </Button>
        </CardContent>
      </Card>

      <section className="mt-6">
        <h2 className="text-3xl font-semibold text-slate-900">Toppmatcher</h2>
        <p className="mt-1 text-sm text-slate-500">Kandidater rangert etter matchscore</p>

        <div className="mt-4 space-y-4">
          {candidates.map((candidate) => (
            <CandidateResultCard
              key={candidate.id}
              candidate={candidate}
              candidateHref={`${candidateBaseHref}/${candidate.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ScreeningResultsView;
