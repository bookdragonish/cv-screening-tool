import ErrorBox from "@/components/ErrorBox";
import ProcessingStatusCard from "@/components/NewScreening/ProcessingStatusCard";
import type { JobDescriptionInput } from "@/validations/UploadJobDescriptionSchema";
import ScreeningProgressSteps from "@/components/NewScreening/ScreeningProgressSteps";
import type { StepStatus } from "@/types/newScreeningTypes";
import UploadJobDescriptionCard from "@/components/NewScreening/UploadJobDescriptionCard";
import HeaderSection from "../HeaderSection";

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
    <section
      className="mx-auto w-full max-w-6xl px-4 sm:px-8"
      aria-labelledby="new-screening-title"
    >
      <HeaderSection id="new-screening-title" header={"Ny skanning"} subsection={"Last opp en stillingsbeskrivelse for å matche aktive kandidater fra kandidat-listen."} />

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
    </section>
  );
}

export default NewScreening;
