import { Check, X } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ScreeningCandidate } from "@/components/newScreening/newScreeningLib/types";
import { getScoreStyles } from "@/components/newScreening/newScreeningLib/utils";

type CandidateResultCardProps = {
  candidate: ScreeningCandidate;
  candidateHref: string;
};

function CandidateResultCard({ candidate, candidateHref }: CandidateResultCardProps) {
  const rankClassName =
    candidate.rank === 1
      ? "border-yellow-300 bg-yellow-100 text-yellow-700"
      : candidate.rank === 2
        ? "border-slate-300 bg-slate-100 text-slate-700"
        : "border-orange-300 bg-orange-100 text-orange-700";

  const { barClassName, badgeClassName } = getScoreStyles(candidate.score);

  return (
    <Card className="gap-0 border-slate-200 bg-white py-0">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {candidate.rank <= 3 ? (
              <span
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-1 text-sm font-semibold ${rankClassName}`}
              >
                #{candidate.rank}
              </span>
            ) : null}
            <h3 className="text-xl font-semibold text-slate-900">{candidate.name}</h3>
          </div>

          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to={candidateHref}>Se CV</Link>
          </Button>
        </div>

        <p className="mt-3 text-sm font-medium text-slate-600">Matchscore</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full ${barClassName}`}
              style={{ width: `${candidate.score}%` }}
            />
          </div>
          <span
            className={`inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${badgeClassName}`}
          >
            {candidate.score}%
          </span>
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Kvalifikasjoner oppfylt</p>
            <ul className="space-y-1 text-slate-600">
              {candidate.met.map((item) => (
                <li key={`${candidate.id}-met-${item}`} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Kvalifikasjoner som mangler</p>
            <ul className="space-y-1 text-slate-600">
              {candidate.missing.map((item) => (
                <li key={`${candidate.id}-missing-${item}`} className="flex items-center gap-2">
                  <X className="h-3.5 w-3.5 text-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CandidateResultCard;
