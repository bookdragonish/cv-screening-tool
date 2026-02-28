import { Navigate } from "react-router";

import ScreeningResultsView from "@/components/newScreening/ScreeningResultsView";
import { useScreeningOutlet } from "@/components/newScreening/newScreeningLib/screeningContext";

function ScreeningResultsPage() {
  const { canGoToResults, jobTitle, analyzedAt, screeningCandidates } = useScreeningOutlet();

  if (!canGoToResults) {
    return <Navigate to="/screening-flow/new-screening" replace />;
  }

  return (
    <ScreeningResultsView
      jobTitle={jobTitle}
      analyzedAt={analyzedAt}
      candidates={screeningCandidates}
      candidateBaseHref="/screening-flow/results"
    />
  );
}

export default ScreeningResultsPage;
