import { useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { GoogleGenAI } from "@google/genai";
import {
  uploadMultipleFilesToGemini,
  type UploadedGeminiFile,
} from "@/api/multipleFileUpload";
import { generateFromGeminiOnFiles, deleteGeminiFiles } from "@/api/geminiGenerate";
import { GEMINI_PROMPTS } from "@/api/prompts";


function GeminiTestPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<UploadedGeminiFile[]>([]);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  const ai = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Mangler VITE_GEMINI_API_KEY");
    return new GoogleGenAI({ apiKey });
  }, []);

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(list);
    //setUploaded([]);
    setResponseText("");
  };

  const onUpload = async () => {
    if (!selectedFiles.length) {
      setResponseText("Ingen filer å laste opp.");
      return;
    }

    setLoading(true);
    setResponseText("");

    try {
      const up = await uploadMultipleFilesToGemini(ai, selectedFiles);
      up.forEach((f) => uploaded.push(f))
      setResponseText(`Lastet opp ${up.length} filer. Klar for å bruke Gemini.`);
    } catch (err) {
      setResponseText(`Filopplasting feilet: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const onAsk = async () => {
    if (!uploaded.length) {
      setResponseText("Ingen filer å analysere.");
      return;
    }

    setLoading(true);
    setResponseText("");

    try {
      const text = await generateFromGeminiOnFiles({
        ai,
        model: "gemini-2.5-flash",
        files: uploaded,
        prompt: GEMINI_PROMPTS.SCREEN_CVS,
        labelFiles: true,
      });
      setResponseText(text);
    } catch (err) {
      setResponseText(`KI generering feilet: ${(err as Error).message}`);
    } finally {
      deleteGeminiFiles(ai, uploaded).catch((err) => {
        console.warn("Sletting av filer feilet:", err)
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2 max-w-xl">
        <div className="w-fit border-2 p-2">

          <input
            type="file"
            accept="application/pdf, application/text"
            multiple

            onChange={ onPickFiles }
          />
        </div>


        <div className="flex gap-2">
          <Button onClick={ onUpload } disabled={ loading || selectedFiles.length === 0 }>
            { loading ? "Jobber..." : "Last opp filer" }
          </Button>

          <Button onClick={ onAsk } disabled={ loading || uploaded.length === 0 }>
            { loading ? "Jobber" : "Spør Gemini" }
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Valgte filer: { selectedFiles.length } - Lastet opp: { uploaded.length }
        </div>
      </div>

      <div className="border rounded p-4 whitespace-pre-wrap flex-1 overflow-auto">
        { responseText || "Gemini repons vil dukke opp her..." }
      </div>
    </div>
  );
}

export default GeminiTestPage;