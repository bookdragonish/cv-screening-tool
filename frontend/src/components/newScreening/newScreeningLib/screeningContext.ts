import { useOutletContext } from "react-router";
import type { Dispatch, SetStateAction } from "react";

import type { JobDescriptionInput } from "@/components/newScreening/newScreeningLib/UploadJobDescriptionSchema";
import type { ScreeningCandidate } from "@/components/newScreening/newScreeningLib/types";

export type FlowState = "upload" | "processing" | "complete";

export type ScreeningOutletContext = {
  flowState: FlowState;
  setFlowState: Dispatch<SetStateAction<FlowState>>;
  jobDescriptionInput: JobDescriptionInput | null;
  setJobDescriptionInput: Dispatch<SetStateAction<JobDescriptionInput | null>>;
  screeningCandidates: ScreeningCandidate[];
  setScreeningCandidates: Dispatch<SetStateAction<ScreeningCandidate[]>>;
  requiredSkills: string[];
  setRequiredSkills: Dispatch<SetStateAction<string[]>>;
  setAnalyzedAtValue: Dispatch<SetStateAction<string>>;
  canGoToResults: boolean;
  analyzedAt: string;
  jobTitle: string;
};

export function useScreeningOutlet() {
  return useOutletContext<ScreeningOutletContext>();
}
