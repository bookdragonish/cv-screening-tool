import { useMemo, useState } from "react";
import { Outlet } from "react-router";

import {
  DEFAULT_JOB_FILE,
} from "@/components/newScreening/newScreeningLib/screeningMockData";
import type { JobDescriptionInput } from "@/components/newScreening/newScreeningLib/UploadJobDescriptionSchema";
import type { ScreeningCandidate } from "@/components/newScreening/newScreeningLib/types";
import { formatAnalyzedDate } from "@/components/newScreening/newScreeningLib/utils";
import type {
  FlowState,
  ScreeningOutletContext,
} from "@/components/newScreening/newScreeningLib/screeningContext";

const DEFAULT_TEXT_JOB_TITLE = "Innlimt_stillingsbeskrivelse";

function ScreeningFlowPage() {
  const [flowState, setFlowState] = useState<FlowState>("upload");
  const [jobDescriptionInput, setJobDescriptionInput] = useState<JobDescriptionInput | null>(null);
  const [screeningCandidates, setScreeningCandidates] = useState<ScreeningCandidate[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [analyzedAtValue, setAnalyzedAtValue] = useState(() => "2026-02-03T15:08:00");

  const analyzedAt = useMemo(() => formatAnalyzedDate(analyzedAtValue), [analyzedAtValue]);

  const canGoToResults = flowState === "complete";

  const jobTitle =
    jobDescriptionInput?.mode === "pdf"
      ? jobDescriptionInput.file.name.replace(/\.pdf$/i, "")
      : jobDescriptionInput?.mode === "text"
        ? DEFAULT_TEXT_JOB_TITLE
        : DEFAULT_JOB_FILE.replace(/\.pdf$/i, "");

  const contextValue: ScreeningOutletContext = {
    flowState,
    setFlowState,
    jobDescriptionInput,
    setJobDescriptionInput,
    screeningCandidates,
    setScreeningCandidates,
    requiredSkills,
    setRequiredSkills,
    setAnalyzedAtValue,
    canGoToResults,
    analyzedAt,
    jobTitle,
  };

  return <Outlet context={contextValue} />;
}

export default ScreeningFlowPage;
