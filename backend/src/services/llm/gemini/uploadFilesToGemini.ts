import { GoogleGenAI, type File as GeminiFile } from "@google/genai";

/**
 * Metadata we keep for each file after it is uploaded to Gemini.
 */
export type UploadedGeminiFile = {
  displayName: string;
  uri: string;
  mimeType: string;
  uploadId: string;
};

/**
 * Waits for a short amount of time.
 */
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls Gemini until an uploaded file is ready to be used.
 */
async function waitForGeminiFileReady(
  ai: GoogleGenAI,
  uploadId: string,
  pollMs = 5000,
  timeoutMs = 2 * 60 * 1000
): Promise<GeminiFile> {
  const start = Date.now();

  let getFile = await ai.files.get({ name: uploadId });

  while (getFile.state === "PROCESSING") {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Time out, venter på filprossesering for: ${uploadId}`);
    }

    await sleep(pollMs);
    getFile = await ai.files.get({ name: uploadId });
  }

  if (getFile.state === "FAILED") {
    throw new Error(`Fil prosessering feilet for: ${uploadId}`);
  }

  if (!getFile.uri || !getFile.mimeType) {
    throw new Error(`Fil uri eller mimeType mangler etter prosessering for: ${uploadId}`);
  }

  return getFile;
}

/**
 * Uploads one or more files to Gemini and returns file metadata needed for
 * later model calls.
 */
export async function uploadFilesToGemini(
  ai: GoogleGenAI,
  files: File[],
  opts?: { pollMs?: number; timeoutMs?: number }
): Promise<UploadedGeminiFile[]> {
  if (!files.length) return [];

  const pollMs = opts?.pollMs ?? 5000;
  const timeoutMs = opts?.timeoutMs ?? 2 * 60 * 1000;

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const uploadedFile = await ai.files.upload({
        file,
        config: { displayName: file.name },
      });

      const readyFile = await waitForGeminiFileReady(
        ai,
        uploadedFile.name as string,
        pollMs,
        timeoutMs
      );

      const uri = readyFile.uri;
      const mimeType = readyFile.mimeType;

      if (!uri || !mimeType) {
        throw new Error(`Fil uri eller mimeType mangler etter prosessering for: ${readyFile.name as string}`);
      }

      return {
        displayName: file.name,
        uri,
        mimeType,
        uploadId: readyFile.name as string,
      };
    })
  );

  return uploaded;
}
