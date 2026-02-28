import NewScreeningFlowView from "@/components/newScreening/NewScreeningFlowView";
import { runScreeningWithGemini } from "@/components/newScreening/newScreeningLib/runScreeningWithGemini";
import type { StepStatus } from "@/components/newScreening/newScreeningLib/types";
import { useScreeningOutlet } from "@/components/newScreening/newScreeningLib/screeningContext";

function NewScreeningPage() {
  const {
    flowState,
    setFlowState,
    jobDescriptionInput,
    setJobDescriptionInput,
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
    <NewScreeningFlowView
      view={flowState === "upload" ? "upload" : "processing"}
      isProcessingComplete={flowState === "complete"}
      jobDescriptionInput={jobDescriptionInput}
      canGoToResults={canGoToResults}
      uploadStatus={uploadStatus}
      processingStatus={processingStatus}
      resultsStatus={resultsStatus}
      resultsHref="/screening-flow/results"
      onCancel={() => {
        setJobDescriptionInput(null);
        setScreeningCandidates([]);
        setRequiredSkills([]);
        setFlowState("upload");
      }}
      onStartProcessing={async (input) => {
        setJobDescriptionInput(input);
        setFlowState("processing");

        try {
          const result = await runScreeningWithGemini({
            jobDescriptionInput: input,
          });

          setScreeningCandidates(result.candidates);
          setRequiredSkills(result.requiredSkills);
          setAnalyzedAtValue(new Date().toISOString());
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
        setJobDescriptionInput(null);
        setScreeningCandidates([]);
        setRequiredSkills([]);
        setFlowState("upload");
      }}
    />
  );
}

export default NewScreeningPage;
