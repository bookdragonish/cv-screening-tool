import { saveScreeningRun } from "@/api/fetchScreenings";
import NewScreening from "@/components/newScreening/NewScreening";
import { runScreeningWithGemini } from "@/components/newScreening/newScreeningLib/runScreeningWithGemini";
import type { StepStatus } from "@/components/newScreening/newScreeningLib/types";
import { useScreeningOutlet } from "@/components/newScreening/newScreeningLib/screeningContext";
import { useState } from "react";

function NewScreeningPage() {
  const [savedScreeningJobPostId, setSavedScreeningJobPostId] = useState<number | null>(null);
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
      resultsHref={
        savedScreeningJobPostId
          ? `/screening-historikk/${savedScreeningJobPostId}`
          : "/new-screening/results"
      }
      onCancel={() => {
        setSavedScreeningJobPostId(null);
        setJobDescriptionInput(null);
        setJobTitleValue(null);
        setScreeningCandidates([]);
        setRequiredSkills([]);
        setFlowState("upload");
      }}
      onStartProcessing={async (input) => {
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
            window.alert("Screeningen ble fullført, men kunne ikke lagres i historikken.");
          }

          setScreeningCandidates(result.candidates);
          setRequiredSkills(result.requiredSkills);
          setJobTitleValue(result.screeningRecord.title);
          setAnalyzedAtValue(analyzedAt);
          setFlowState("complete");
        } catch (error) {
          console.error("Screening med Gemini feilet:", error);
          window.alert(
            error instanceof Error
              ? error.message
              : "Screening feilet. Prøv igjen om et øyeblikk.",
          );
          setFlowState("upload");
        }
      }}
      onStartNew={() => {
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
