
/**
 * Custom hook to fetch all customers the API based on request parameters.
 * 
 * Also sets storage
 *
 * The hook manages loading and error state internally, returning:
 * - `data` → the fetched recipe data (paginated result)
 * - `isLoading` → whether the request is currently in progress
 * - `isError` → whether the request failed
 *
 * The request runs automatically whenever `args` changes.
 *
 * @param args - Request parameters used to determine which dataset to fetch
 * @returns An object containing the data, loading state, and error state
 */

import getAllCandidates from "@/api/fetchCandidates";
import { useEffect, useState } from "react";


export function useFetchCandidates() {
  const [data, setData] = useState<any>({ });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // This useffect runs whenever the arguments passed in changes (when we want to get someting else)
  useEffect(() => {
    async function APIFetch() {
      try {
        setIsLoading(true);
        setIsError(false);
        // Runs the fetchAll function
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