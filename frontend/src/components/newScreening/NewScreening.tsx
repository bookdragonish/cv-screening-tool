import ErrorBox from "@/components/ErrorBox";
import NewScreeningHeader from "@/components/NewScreening/NewScreeningHeader";
import ProcessingStatusCard from "@/components/NewScreening/ProcessingStatusCard";
import type { JobDescriptionInput } from "@/validations/UploadJobDescriptionSchema";
import ScreeningProgressSteps from "@/components/NewScreening/ScreeningProgressSteps";
import type { StepStatus } from "@/types/newScreeningTypes";
import UploadJobDescriptionCard from "@/components/NewScreening/UploadJobDescriptionCard";

type NewScreeningError = {
  title: string;
  message: string;
};

type NewScreeningProps = {
  view: "upload" | "processing";
  isProcessingComplete: boolean;
  jobDescriptionInput: JobDescriptionInput | null;
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
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
      <NewScreeningHeader />

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
