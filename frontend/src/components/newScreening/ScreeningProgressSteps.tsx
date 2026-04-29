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
      : "border-(--color-primary) bg-(--color-primary) text-white";

  return (
    <li
      className={`flex flex-col items-center ${STEP_WIDTH_CLASS}`}
      aria-current={status === "active" ? "step" : undefined}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${containerClassName}`}
        aria-hidden="true"
      >
        {status === "completed" ? <CheckIcon className="h-4 w-4" /> : number}
      </div>
      <p className="mt-2 text-center text-sm text-slate-600">{label}</p>
    </li>
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
    <section className="mt-8 overflow-x-auto pb-1" aria-label="Screeningfremdrift">
      <div className="mx-auto w-full max-w-160 min-w-fit">
        <ol className="flex items-start justify-center gap-2 sm:gap-3">
          <StepNode number={1} label="Last opp stillingsbeskrivelse" status={uploadStatus} />

          <li className={`shrink-0 ${CONNECTOR_WIDTH_CLASS}`} aria-hidden="true">
            <div className="flex h-8 items-center">
              <Progress
                value={connectorValue(processingStatus)}
                className="h-1 w-full bg-slate-300 *:data-[slot=progress-indicator]:bg-primary"
              />
            </div>
          </li>

          <StepNode number={2} label="Behandling" status={processingStatus} />

          <li className={`shrink-0 ${CONNECTOR_WIDTH_CLASS}`} aria-hidden="true">
            <div className="flex h-8 items-center">
              <Progress
                value={connectorValue(resultsStatus)}
                className="h-1 w-full bg-slate-300 *:data-[slot=progress-indicator]:bg-primary"
              />
            </div>
          </li>

          <StepNode number={3} label="Resultater" status={resultsStatus} />
        </ol>
      </div>
    </section>
  );
}

export default ScreeningProgressSteps;
