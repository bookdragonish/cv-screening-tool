import { getAllCandidates, getCandidate } from "@/api/fetchCandidates";
import type { Candidate } from "@/types/candidate";
import { useEffect, useState } from "react";
/**
 * Custom hook to fetch all customers the API based on request parameters.
 *
 * Also sets storage
 *
 * The hook manages loading and error state internally, returning:
 * - `data` → the fetched candidate data (paginated result)
 * - `isLoading` → whether the request is currently in progress
 * - `isError` → whether the request failed
 *
 * The request runs automatically whenever `args` changes.
 *
 * @param id - on id="" get all when id ="2" gets candidate
 * @returns An object containing the data, loading state, and error state
 */

export function useFetchCandidates() {
  const [data, setData] = useState<Candidate[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // This useffect runs whenever the arguments passed in changes (when we want to get someting else)
  useEffect(() => {
    async function APIFetch() {
      try {
        setIsLoading(true);
        setIsError(false);

        const response = await getAllCandidates();
        setData(response);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    APIFetch();
  }, []);
  return { data, isError, isLoading };
}

export function useFetchCandidate(id: string) {
  const [data, setData] = useState<Candidate>({
    id: 0,
    name: "",
    email: "",
    created_at: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // This useffect runs whenever the arguments passed in changes (when we want to get someting else)
  useEffect(() => {
    async function APIFetch() {
      try {
        setIsLoading(true);
        setIsError(false);

        const response = await getCandidate(id);
        setData(response);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    APIFetch();
  }, []);
  return { data, isError, isLoading };
}
