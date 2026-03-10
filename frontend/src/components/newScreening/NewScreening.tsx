import ErrorBox from "@/components/ErrorBox";
import NewScreeningHeader from "@/components/newScreening/NewScreeningHeader";
import ProcessingStatusCard from "@/components/newScreening/ProcessingStatusCard";
import type { JobDescriptionInput } from "@/validations/UploadJobDescriptionSchema";
import ScreeningProgressSteps from "@/components/newScreening/ScreeningProgressSteps";
import type { StepStatus } from "@/types/newScreeningTypes";
import UploadJobDescriptionCard from "@/components/newScreening/UploadJobDescriptionCard";

type NewScreeningError = {
  title: string;
  message: string;
};

type NewScreeningProps = {
  view: "upload" | "processing";
  isProcessingComplete: boolean;
  jobDescriptionInput: JobDescriptionInput | null;
  canGoToResults: boolean;
  uploadStatus: StepStatus;
  processingStatus: StepStatus;
  resultsStatus: StepStatus;
  resultsHref: string;
  errorBox: NewScreeningError | null;
  showRetryLabel: boolean;
  onCancel: () => void;
  onStartProcessing: (input: JobDescriptionInput) => void | Promise<void>;
  onStartNew: () => void;
};

function NewScreening({
  view,
  isProcessingComplete,
  jobDescriptionInput,
  canGoToResults,
  uploadStatus,
  processingStatus,
  resultsStatus,
  resultsHref,
  errorBox,
  showRetryLabel,
  onCancel,
  onStartProcessing,
  onStartNew,
}: NewScreeningProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <NewScreeningHeader canGoToResults={canGoToResults} />

      <ScreeningProgressSteps
        uploadStatus={uploadStatus}
        processingStatus={processingStatus}
        resultsStatus={resultsStatus}
      />

      {errorBox ? (
        <div className="mt-6">
          <ErrorBox title={errorBox.title} message={errorBox.message} />
        </div>
      ) : null}

      {view === "upload" ? (
        <UploadJobDescriptionCard
          initialInput={jobDescriptionInput}
          showRetryLabel={showRetryLabel}
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

export default NewScreening;
