import ErrorBox from '@/components/ErrorBox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFetchCandidate } from '@/hooks/useFetchCandidates';
import { useFetchPDF } from '@/hooks/useFetchPDF';
import { useFetchScreenings } from '@/hooks/useFetchScreening';
import React from 'react'
import { Download } from 'lucide-react';
import { Link, useParams } from 'react-router';
import Breadcrumbs from '@/components/Breadcrumbs';

function Candidate() {
    const { candidateId } = useParams<{ candidateId: string }>();

    if (!candidateId) {
      return (
        <section className="w-full flex justify-center my-10">
          <ErrorBox
            title="Invalid parameters"
            message="Missing candidate ID"
          />
        </section>
      );
    }

  const { data: candidate, isLoading: candidateLoading, isError: candidateError } = useFetchCandidate(candidateId);

  const { screeningData: allScreenings, isLoading: allScreeningsLoading, isError: allScreeningsError } = useFetchScreenings();

 
  // Filter all screenings to show only ones where this candidate participated
  const candidateScreenings = allScreenings.filter(s =>
    s.candidates.some(candidate => candidate.candidateId === Number(candidateId))
  ).map(s => ({
    ...s,
    candidateResult: s.candidates.find(c => c.candidateId === Number(candidateId))!
  }));

  const { documentURL: candidateCV, isLoading: candidateCVLoading, isError: candidateCVError } = useFetchPDF(Number(candidateId));
  
  if (candidateLoading || allScreeningsLoading || !candidate) {
    return (
      <main className="flex justify-center items-center h-170">
        <Spinner />
      </main>
    );
  }
  
  if (candidateError || allScreeningsError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title="Kan ikke hente kandidatdata"
          message="Prøv å refresh eller sjekk at kandidatdata finnes"
        />
      </section>
    );
  }

  const formatDate = (dateValue: string) =>
    new Intl.DateTimeFormat("nb-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  
  return (
    <main className="mx-auto max-w-7xl p-6">
      <Breadcrumbs second_site_name={"Kandidater"} second_site_link='/kandidater' third_site_name={candidate.name} />
      
      <div className="space-y-4">
        <div className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="mt-1 pb-3 text-3xl font-semibold text-(--color-dark)">
                {candidate.name}
              </h1>
              <h2 className="text-sm font-semibold text-(--color-dark) opacity-75">
                Kandidatprofil
              </h2>
              <div className="mt-4 flex items-start gap-3">
                <div>
                  <p className="text-sm text-(--color-dark) opacity-75">
                    Opprettet: {formatDate(candidate.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <TooltipProvider>
              {candidateCV ? (
                <Button variant="outline" className="h-auto px-6 py-3" asChild>
                  <a
                    href={candidateCV.toString()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="size-5" />
                    Last ned CV
                  </a>
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button variant="outline" className="h-auto px-6 py-3 cursor-not-allowed" disabled>
                        <Download className="size-5" />
                        Last ned CV
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Kandidaten har ingen CV
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* All Screenings Section */}
        <div className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-(--color-dark)">
            Tidligere skanninger for {candidate.name}
          </h2>
          
          {allScreeningsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : allScreeningsError || candidateScreenings.length === 0 ? (
            <p className="text-sm text-(--color-dark) opacity-75">
              {candidateScreenings.length === 0 
                ? "Kandidaten har ikke deltatt i noen tidligere skanninger."
                : "Det oppstod en feil ved henting av skanninger."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-(--color-primary)">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-(--color-dark)">
                      Stillingstittel
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-(--color-dark)">
                      Dato
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                      Matchscore
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-(--color-dark)">
                      Rangering
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidateScreenings.map((screen) => (
                    <tr key={screen.jobPostId} className="border-b border-(--color-primary) hover:bg-(--color-light) transition-colors">
                      <td className="px-4 py-3 text-sm text-(--color-dark)">
                        <Link
                          to={`/screening-historikk/${screen.jobPostId}`}
                          className="cursor-pointer text-(--color-primary) hover:underline"
                        >
                          {screen.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-(--color-dark)">
      at                   {formatDate(screen.screenedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          screen.candidateResult.score >= 70
                            ? 'bg-green-100 text-green-800'
                            : screen.candidateResult.score >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-300 text-gray-800'
                        }`}>
                          {screen.candidateResult.score < 50? "N/A": Math.round(screen.candidateResult.score)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          screen.candidateResult.qualified
                            ? 'bg-(--color-light) text-(--color-dark)'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {screen.candidateResult.qualified ? "Kvalifisert" : "Ikke kvalifisert"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-(--color-dark)">
                        {screen.candidateResult.rank 
                          ? `#${screen.candidateResult.rank} av ${screen.candidates.length}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Candidate
