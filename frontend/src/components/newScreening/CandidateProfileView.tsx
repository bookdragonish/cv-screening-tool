import { ArrowLeft, Check, CheckCircle2, Download, FileText, X } from "lucide-react";
import { Link } from "react-router";

import ScreeningBreadcrumbs from "@/components/newScreening/ScreeningBreadcrumbs";
import type { ScreeningCandidate } from "@/components/newScreening/newScreeningLib/types";
import { getScoreStyles } from "@/components/newScreening/newScreeningLib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CandidateProfileViewProps = {
  candidate: ScreeningCandidate;
  jobTitle: string;
  requiredSkills: string[];
  backHref: string;
};

function CandidateProfileView({
  candidate,
  jobTitle,
  requiredSkills,
  backHref,
}: CandidateProfileViewProps) {
  const { badgeClassName } = getScoreStyles(candidate.score);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <ScreeningBreadcrumbs
        current="candidate"
        canGoToResults={true}
        candidateName={candidate.name}
      />

      <Card className="gap-0 border-slate-200 bg-white py-0">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="text-slate-600"
              aria-label="Tilbake til resultater"
            >
              <Link to={backHref}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{candidate.name}</h1>
              <p className="mt-1 text-sm text-slate-500">Kandidatprofil</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-xl font-semibold ${badgeClassName}`}>
              Match: {candidate.score}%
            </span>
            <Button variant="outline" className="border-slate-300 bg-white">
              <Download className="mr-2 h-4 w-4" />
              Last ned CV
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 border-slate-200 bg-white py-0">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              Kandidat-CV
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6 text-base text-slate-700">
            <div>
              <p className="text-xl font-semibold text-slate-900">{candidate.name}</p>
              <p>{candidate.role}</p>
            </div>

            <div>
              <p className="font-medium text-slate-900">Kontakt:</p>
              <p>E-post: {candidate.email}</p>
              <p>Telefon: {candidate.phone}</p>
            </div>

            <div>
              <p className="font-medium text-slate-900">Profesjonell oppsummering:</p>
              <p className="mt-1">{candidate.summary}</p>
            </div>

            <div>
              <p className="font-medium text-slate-900">Ferdigheter:</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {candidate.met.slice(0, 3).map((skill) => (
                  <mark key={skill} className="rounded bg-yellow-200 px-1.5 py-0.5 text-slate-900">
                    {skill}
                  </mark>
                ))}
                {candidate.met.slice(3).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-slate-900">Erfaring:</p>
              <ul className="mt-1 space-y-1">
                {candidate.experience.map((line) => (
                  <li key={line}>- {line}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-900">Utdanning:</p>
              <ul className="mt-1 space-y-1">
                {candidate.education.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-slate-200 bg-white py-0">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-2xl text-slate-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Stillingsbeskrivelse
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6 text-base text-slate-700">
            <div>
              <p className="text-xl font-semibold text-slate-900">{jobTitle}</p>
              <p className="mt-2">
                Stilling som senior fullstack-utvikler med fokus på moderne webteknologier og
                skyplattformer.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="font-semibold text-slate-900">Påkrevde ferdigheter:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                {requiredSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-4 gap-0 border-slate-200 bg-white py-0">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">Matchoppsummering</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 pb-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              <Check className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
              Kvalifikasjoner oppfylt ({candidate.met.length})
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              {candidate.met.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              <X className="mr-1 inline h-3.5 w-3.5 text-orange-500" />
              Kvalifikasjoner som mangler ({candidate.missing.length})
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              {candidate.missing.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CandidateProfileView;
