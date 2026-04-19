import ErrorBox from "@/components/ErrorBox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFetchCandidate } from "@/hooks/useFetchCandidates";
import { useFetchPDF } from "@/hooks/useFetchPDF";
import { Clock, Download } from "lucide-react";
import { useParams } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Badge } from "../components/ui/badge";
import { formatDate } from "@/utils/dateFormat";
import CandidateScanningTable from "@/components/CandidatePage/CandidateScanningTable";

function Candidate() {
  const { candidateId } = useParams<{ candidateId: string }>();

  if (!candidateId) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox title="Invalid parameters" message="Missing candidate ID" />
      </section>
    );
  }

  const {
    data: candidate,
    isLoading: candidateLoading,
    isError: candidateError,
  } = useFetchCandidate(candidateId);

  const {
    documentURL: candidateCV,
    isLoading: candidateCVLoading,
    isError: candidateCVError,
  } = useFetchPDF(Number(candidateId));

  if (candidateLoading || !candidate) {
    return (
      <main className="flex justify-center items-center h-170">
        <Spinner />
      </main>
    );
  }

  if (candidateError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title="Kan ikke hente kandidat"
          message="Prøv å refresh eller sjekk at kandidat finnes"
        />
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <Breadcrumbs
        second_site_name={"Kandidater"}
        second_site_link="/kandidater"
        third_site_name={candidate.name}
      />

      <div className="space-y-4">
        <div className=" rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="mt-1 pb-3 text-3xl font-semibold text-(--color-dark)">
                {candidate.name}
              </h1>

              <div className="flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{formatDate(candidate.created_at)}</span>
              </div>

              <p className="text-sm text-(--color-dark) opacity-75 mt-1">
                Arbeidsmiljøloven:{" "}
                {!candidate.aml46 && !candidate.aml47 ? (
                  "Ingen"
                ) : (
                  <>
                    {candidate.aml46 ? (
                      <Badge variant="secondary">{"AML §4.6"}</Badge>
                    ) : (
                      ""
                    )}
                    {candidate.aml47 ? (
                      <Badge variant="secondary">{"AML §4.7"}</Badge>
                    ) : (
                      ""
                    )}
                  </>
                )}
              </p>
              <p className="text-sm text-(--color-dark) opacity-75">
                Ansiennitet:{" "}
                {!candidate.ansiennitet ? (
                  "Ingen"
                ) : (
                  <>{candidate.ansiennitet}</>
                )}
              </p>
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
                      <Button
                        variant="outline"
                        className="h-auto px-6 py-3 cursor-not-allowed"
                        disabled
                      >
                        <Download className="size-5" />
                        Last ned CV
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Kandidaten har ingen CV</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        <CandidateScanningTable
          candidateId={candidateId}
          candidateName={candidate.name}
        />
      </div>
    </main>
  );
}

export default Candidate;
