import { saveScreeningRun } from "@/api/fetchScreenings";
import { runScreeningWithGemini } from "@/api/runScreeningWithGemini";
import NewScreening from "@/components/NewScreening/NewScreening";
import type { JobDescriptionInput } from "@/validations/UploadJobDescriptionSchema";
import type { StepStatus } from "@/types/newScreeningTypes";
import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

type NewScreeningError = {
  title: string;
  message: string;
};

type FlowState = "upload" | "processing" | "complete";

function NewScreeningPage() {
  const [flowState, setFlowState] = useState<FlowState>("upload");
  const [jobDescriptionInput, setJobDescriptionInput] =
    useState<JobDescriptionInput | null>(null);
  const [errorBox, setErrorBox] = useState<NewScreeningError | null>(null);
  const [savedScreeningJobPostId, setSavedScreeningJobPostId] = useState<
    number | null
  >(null);
  const [hasProcessingError, setHasProcessingError] = useState(false);

  const uploadStatus: StepStatus =
    flowState === "upload" ? "active" : "completed";
  const processingStatus: StepStatus =
    flowState === "upload"
      ? "upcoming"
      : flowState === "processing"
        ? "active"
        : "completed";
  const resultsStatus: StepStatus =
    flowState === "complete" ? "active" : "upcoming";

  const resetToUpload = () => {
    setSavedScreeningJobPostId(null);
    setJobDescriptionInput(null);
    setFlowState("upload");
  };

  const handleStartProcessing = async (input: JobDescriptionInput) => {
    setErrorBox(null);
    setHasProcessingError(false);
    setSavedScreeningJobPostId(null);
    setJobDescriptionInput(input);
    setFlowState("processing");

    try {
      const { screeningRecord } = await runScreeningWithGemini({
        jobDescriptionInput: input,
      });

      try {
        const savedScreening = await saveScreeningRun(screeningRecord);
        setSavedScreeningJobPostId(savedScreening.jobPostId);
      } catch (saveError) {
        console.error("Kunne ikke lagre screeninghistorikk:", saveError);
        setErrorBox({
          title: "Screeningen ble ikke lagret i historikken",
          message:
            "Screeningen ble fullfort, men kunne ikke lagres i historikken.",
        });
      }

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
  };

  return (
    <main id="main-content" className="mx-auto max-w-7xl bg-gray-50 px-4 py-6 sm:px-8">
      <Breadcrumbs second_site_name={"Ny skanning"}/>
      <NewScreening
        view={flowState === "upload" ? "upload" : "processing"}
        isProcessingComplete={flowState === "complete"}
        jobDescriptionInput={jobDescriptionInput}
        uploadStatus={uploadStatus}
        processingStatus={processingStatus}
        resultsStatus={resultsStatus}
        errorBox={errorBox}
        showRetryLabel={hasProcessingError}
        resultsHref={
          savedScreeningJobPostId
            ? `/screening-historikk/${savedScreeningJobPostId}`
            : "/screening-historikk"
        }
        onCancel={() => {
          setErrorBox(null);
          setHasProcessingError(false);
          resetToUpload();
        }}
        onStartProcessing={handleStartProcessing}
        onStartNew={() => {
          setErrorBox(null);
          setHasProcessingError(false);
          resetToUpload();
        }}
      />
    </main>
  );
}

export default NewScreeningPage;
