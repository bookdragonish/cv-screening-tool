import {
  getScreeningByJobPostId,
  type ScreeningDetails,
} from "@/api/fetchScreenings";
import { useEffect, useState } from "react";

export function useFetchScreening(jobPostId?: string) {
  const [data, setData] = useState<ScreeningDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!jobPostId) {
      setIsError(true);
      setIsLoading(false);
      setData(null);
      return;
    }

    async function fetchDetails() {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await getScreeningByJobPostId(Number(jobPostId));
        setData(response);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetails();
  }, [jobPostId]);

  return { data, isLoading, isError };
}
