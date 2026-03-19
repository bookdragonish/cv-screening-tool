import { CheckIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { StepStatus } from "@/types/newScreeningTypes";

type ScreeningProgressStepsProps = {
  uploadStatus: StepStatus;
  processingStatus: StepStatus;
  resultsStatus: StepStatus;
};

const STEP_WIDTH_CLASS = "w-[102px] sm:w-[130px]";
const CONNECTOR_WIDTH_CLASS = "w-[clamp(1.25rem,10vw,10rem)]";

function StepNode({
  number,
  label,
  status,
}: {
  number: number;
  label: string;
  status: StepStatus;
}) {
  const containerClassName =
    status === "upcoming"
      ? "border-slate-300 bg-slate-100 text-slate-500"
      : "border-primary bg-primary text-white";

  return (
    <div className={`flex flex-col items-center ${STEP_WIDTH_CLASS}`}>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${containerClassName}`}
      >
        {status === "completed" ? <CheckIcon className="h-4 w-4" /> : number}
      </div>
      <p className="mt-2 text-center text-sm text-slate-600">{label}</p>
    </div>
  );
}

function connectorValue(nextStepStatus: StepStatus) {
  return nextStepStatus === "upcoming" ? 0 : 100;
}

function ScreeningProgressSteps({
  uploadStatus,
  processingStatus,
  resultsStatus,
}: ScreeningProgressStepsProps) {
  return (
    <div className="mt-8 overflow-x-auto pb-1">
      <div className="mx-auto w-full max-w-160 min-w-fit">
        <div className="flex items-start justify-center gap-2 sm:gap-3">
          <StepNode number={1} label="Last opp stillingsbeskrivelse" status={uploadStatus} />

          <div className={`shrink-0 ${CONNECTOR_WIDTH_CLASS}`}>
            <div className="flex h-8 items-center">
              <Progress
                value={connectorValue(processingStatus)}
                className="h-1 w-full bg-slate-300 *:data-[slot=progress-indicator]:bg-primary"
              />
            </div>
          </div>

          <StepNode number={2} label="Behandling" status={processingStatus} />

          <div className={`shrink-0 ${CONNECTOR_WIDTH_CLASS}`}>
            <div className="flex h-8 items-center">
              <Progress
                value={connectorValue(resultsStatus)}
                className="h-1 w-full bg-slate-300 *:data-[slot=progress-indicator]:bg-primary"
              />
            </div>
          </div>

          <StepNode number={3} label="Resultater" status={resultsStatus} />
        </div>
      </div>
    </div>
  );
}

export default ScreeningProgressSteps;
