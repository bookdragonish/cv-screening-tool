import { getPDF } from "@/api/fetchPDF";
import { useEffect, useState, type SetStateAction } from "react";

export function useFetchPDF(id: number) {
  const [documentURL, setDocumentURL] = useState<SetStateAction<string | null>>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // This useffect runs whenever the arguments passed in changes (when we want to get someting else)
  useEffect(() => {
    if(!id) return;

    async function APIFetch() {
      try {
        setIsLoading(true);
        setIsError(false);

        const response = await getPDF(id + "");
        setDocumentURL(response);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    APIFetch();
  }, [id]);
  return { documentURL, isError, isLoading };
}
