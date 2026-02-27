import {
  getScreeningByJobPostId,
  getScreeningHistory,
  type ScreeningDetails,
} from "@/api/fetchScreenings";
import { useEffect, useState } from "react";

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
      } catch (error) {
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
