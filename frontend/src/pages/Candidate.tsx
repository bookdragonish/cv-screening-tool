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
import { Download, FileText } from "lucide-react";
import { useParams } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Badge } from "../components/ui/badge";
import CandidateScanningTable from "@/components/CandidatePage/CandidateScanningTable";
import { formatAnsiennitet } from "@/utils/formatAnsiennitet";
import { useState } from "react";
import PdfPreviewOverlay from "@/components/PdfPreviewOverlay";

function Candidate() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [previewId, setPreviewId] = useState<number | null>(null);

  const candidateIdValue = candidateId ?? "";
  const candidateIdNumber = candidateId ? Number(candidateId) : 0;

  const {
    data: candidate,
    isLoading: candidateLoading,
    isError: candidateError,
  } = useFetchCandidate(candidateIdValue);

  const { documentURL: candidateCV } = useFetchPDF(candidateIdNumber);

  if (!candidateId) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox title="Invalid parameters" message="Missing candidate ID" />
      </section>
    );
  }

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
              <p className="text-sm text-(--color-dark) mt-1">
                  Arbeidsmiljøloven:{" "}
                  {!candidate.aml46 && !candidate.aml47 ? (
                    "Ingen"
                  ) : (
                    <>
                      {candidate.aml46 ? <Badge variant="aml">{"AML §4.6"}</Badge> : ""}
                      {candidate.aml47 ? <Badge variant="aml">{"AML §4.7"}</Badge> : ""}
                    </>
                  )}
              </p>
              <p className="text-sm text-(--color-dark)">
                Ansiennitet: {formatAnsiennitet(candidate.ansiennitet)}
              </p>
            </div>
            <TooltipProvider>
              <div className="flex gap-2">
                {candidate.has_pdf ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="light"
                        className="h-auto px-6 py-3"
                        onClick={() => setPreviewId(candidate.id)}
                      >
                        <FileText className="size-5" />
                        Forhåndsvis CV
                      </Button>
                    </TooltipTrigger>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="light"
                          className="h-auto px-6 py-3 cursor-not-allowed"
                          disabled
                        >
                          <FileText className="size-5" />
                          Forhåndsvis CV
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Kandidaten har ingen CV</TooltipContent>
                  </Tooltip>
                )}

                {candidateCV ? (
                  <Button variant="light" className="h-auto px-6 py-3" asChild>
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
                          variant="light"
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
              </div>
            </TooltipProvider>
          </div>
        </div>

        <CandidateScanningTable
          candidateId={candidateId}
          candidateName={candidate.name}
        />
      </div>
      {previewId != null && (
        <PdfPreviewOverlay
          candidates={[{ id: candidate.id, name: candidate.name }]}
          initialId={previewId}
          onClose={() => setPreviewId(null)}
        />
      )}
    </main>
  );
}

export default Candidate;
