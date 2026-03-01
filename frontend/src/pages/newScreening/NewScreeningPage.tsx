import { saveScreeningRun } from "@/api/fetchScreenings";
import NewScreening from "@/components/newScreening/NewScreening";
import { runScreeningWithGemini } from "@/components/newScreening/newScreeningLib/runScreeningWithGemini";
import type { StepStatus } from "@/components/newScreening/newScreeningLib/types";
import { useScreeningOutlet } from "@/components/newScreening/newScreeningLib/screeningContext";
import { useState } from "react";

type NewScreeningError = {
  title: string;
  message: string;
};

function NewScreeningPage() {
  const [errorBox, setErrorBox] = useState<NewScreeningError | null>(null);
  const [savedScreeningJobPostId, setSavedScreeningJobPostId] = useState<number | null>(null);
  const [hasProcessingError, setHasProcessingError] = useState(false);
  const {
    flowState,
    setFlowState,
    jobDescriptionInput,
    setJobDescriptionInput,
    setJobTitleValue,
    setScreeningCandidates,
    setRequiredSkills,
    setAnalyzedAtValue,
    canGoToResults,
  } = useScreeningOutlet();

  const uploadStatus: StepStatus = flowState === "upload" ? "active" : "completed";
  const processingStatus: StepStatus =
    flowState === "upload" ? "upcoming" : flowState === "processing" ? "active" : "completed";
  const resultsStatus: StepStatus = flowState === "complete" ? "active" : "upcoming";

  return (
    <NewScreening
      view={flowState === "upload" ? "upload" : "processing"}
      isProcessingComplete={flowState === "complete"}
      jobDescriptionInput={jobDescriptionInput}
      canGoToResults={canGoToResults}
      uploadStatus={uploadStatus}
      processingStatus={processingStatus}
      resultsStatus={resultsStatus}
      errorBox={errorBox}
      showRetryLabel={hasProcessingError}
      resultsHref={
        savedScreeningJobPostId
          ? `/screening-historikk/${savedScreeningJobPostId}`
          : "/new-screening/results"
      }
      onCancel={() => {
        setErrorBox(null);
        setHasProcessingError(false);
        setSavedScreeningJobPostId(null);
        setJobDescriptionInput(null);
        setJobTitleValue(null);
        setScreeningCandidates([]);
        setRequiredSkills([]);
        setFlowState("upload");
      }}
      onStartProcessing={async (input) => {
        setErrorBox(null);
        setHasProcessingError(false);
        setSavedScreeningJobPostId(null);
        setJobDescriptionInput(input);
        setJobTitleValue(null);
        setFlowState("processing");

        try {
          const result = await runScreeningWithGemini({
            jobDescriptionInput: input,
          });
          let analyzedAt = new Date().toISOString();

          try {
            const savedScreening = await saveScreeningRun(result.screeningRecord);
            analyzedAt = savedScreening.screenedAt;
            setSavedScreeningJobPostId(savedScreening.jobPostId);
          } catch (saveError) {
            console.error("Kunne ikke lagre screeninghistorikk:", saveError);
            setErrorBox({
              title: "Screeningen ble ikke lagret i historikken",
              message: "Screeningen ble fullfort, men kunne ikke lagres i historikken.",
            });
          }

          setScreeningCandidates(result.candidates);
          setRequiredSkills(result.requiredSkills);
          setJobTitleValue(result.screeningRecord.title);
          setAnalyzedAtValue(analyzedAt);
          setFlowState("complete");
        } catch (error) {
          console.error("Screening med Gemini feilet:", error);
          setHasProcessingError(true);
          setErrorBox({
            title: "Screening feilet",
            message:
              error instanceof Error
                ? error.message
                : "Screening feilet. Prov igjen om et oyeblikk.",
          });
          setFlowState("upload");
        }
      }}
      onStartNew={() => {
        setErrorBox(null);
        setHasProcessingError(false);
        setSavedScreeningJobPostId(null);
        setJobDescriptionInput(null);
        setJobTitleValue(null);
        setScreeningCandidates([]);
        setRequiredSkills([]);
        setFlowState("upload");
      }}
    />
  );
}

export default NewScreeningPage;
