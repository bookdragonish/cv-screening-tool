import NewScreeningHeader from "@/components/newScreening/NewScreeningHeader";
import ProcessingStatusCard from "@/components/newScreening/ProcessingStatusCard";
import type { JobDescriptionInput } from "@/components/newScreening/newScreeningLib/UploadJobDescriptionSchema";
import ScreeningProgressSteps from "@/components/newScreening/ScreeningProgressSteps";
import type { StepStatus } from "@/components/newScreening/newScreeningLib/types";
import UploadJobDescriptionCard from "@/components/newScreening/UploadJobDescriptionCard";

type NewScreeningFlowViewProps = {
  view: "upload" | "processing";
  isProcessingComplete: boolean;
  jobDescriptionInput: JobDescriptionInput | null;
  canGoToResults: boolean;
  uploadStatus: StepStatus;
  processingStatus: StepStatus;
  resultsStatus: StepStatus;
  resultsHref: string;
  onCancel: () => void;
  onStartProcessing: (input: JobDescriptionInput) => void | Promise<void>;
  onStartNew: () => void;
};

function NewScreeningFlowView({
  view,
  isProcessingComplete,
  jobDescriptionInput,
  canGoToResults,
  uploadStatus,
  processingStatus,
  resultsStatus,
  resultsHref,
  onCancel,
  onStartProcessing,
  onStartNew,
}: NewScreeningFlowViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <NewScreeningHeader canGoToResults={canGoToResults} />

      <ScreeningProgressSteps
        uploadStatus={uploadStatus}
        processingStatus={processingStatus}
        resultsStatus={resultsStatus}
      />

      {view === "upload" ? (
        <UploadJobDescriptionCard
          initialInput={jobDescriptionInput}
          onCancel={onCancel}
          onStartProcessing={onStartProcessing}
        />
      ) : (
        <ProcessingStatusCard
          isProcessingComplete={isProcessingComplete}
          onStartNew={onStartNew}
          resultsHref={resultsHref}
        />
      )}
    </div>
  );
}

export default NewScreeningFlowView;
