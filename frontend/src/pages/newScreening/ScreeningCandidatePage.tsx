import { Navigate, useParams } from "react-router";

import CandidateProfileView from "@/components/newScreening/CandidateProfileView";
import { useScreeningOutlet } from "@/components/newScreening/newScreeningLib/screeningContext";

function ScreeningCandidatePage() {
  const { candidateId } = useParams();
  const { canGoToResults, jobTitle, screeningCandidates, requiredSkills } = useScreeningOutlet();

  if (!canGoToResults) {
    return <Navigate to="/screening/new-screening" replace />;
  }

  const parsedCandidateId = Number(candidateId);

  if (!candidateId || Number.isNaN(parsedCandidateId)) {
    return <Navigate to="/screening/results" replace />;
  }

  const candidate = screeningCandidates.find((item) => item.id === parsedCandidateId);

  if (!candidate) {
    return <Navigate to="/screening/results" replace />;
  }

  return (
    <CandidateProfileView
      candidate={candidate}
      jobTitle={jobTitle}
      requiredSkills={requiredSkills}
      backHref="/screening/results"
    />
  );
}

export default ScreeningCandidatePage;
