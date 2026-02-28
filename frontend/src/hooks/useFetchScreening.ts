import {
  getScreeningByJobPostId,
  getScreeningHistory,
} from "@/api/fetchScreenings";
import type { ScreeningDetails } from "@/types/screening";
import { useEffect, useState } from "react";

/**
 * Custom hook to fetch all screenings the API based on request parameters.
 *
 * Also sets storage
 *
 * The hooks manages loading and error state internally, returning:
 * - `data` → the fetched candidate data (paginated result)
 * - `isLoading` → whether the request is currently in progress
 * - `isError` → whether the request failed
 *
 * The request runs automatically whenever `args` changes.
 *
 * @param id - on id="" get all when id ="2" gets candidate
 * @returns An object containing the data, loading state, and error state
 */


export function useFetchScreenings() {
  const [screeningData, setScreeningData] = useState<ScreeningDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await getScreeningHistory();
        setScreeningData(response);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, []);
  return { screeningData, isLoading, isError };
}

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
