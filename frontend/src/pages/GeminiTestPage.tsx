import { useMemo, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { GoogleGenAI } from "@google/genai";

import {
  uploadMultipleFilesToGemini,
  type UploadedGeminiFile,
} from "@/api/multipleFileUpload";

import { generateFromGeminiOnFiles, deleteGeminiFiles } from "@/api/geminiGenerate";
import { generateFromGeminiText } from "@/api/geminiText";

import {
  buildJobAdProfilePrompt,
  buildCandidateEvalPrompt,
  buildRankingPrompt,
} from "@/api/prompts";

import {
  parseJobProfile,
  parseCandidateEval,
  parseRanking,
} from "@/api/schemas";

import type { CandidateEval, Ranking } from "@/api/types";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";

function GeminiTestPage() {
  const [jobAdText, setJobAdText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<UploadedGeminiFile[]>([]);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  // for senere bruk, hvis bi skal bruke geminis output
  const [candidateEvals, setCandidateEvals] = useState<CandidateEval[]>([]);
  const [ranking, setRanking] = useState<Ranking | null>(null);

  const ai = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Mangler VITE_GEMINI_API_KEY");
    return new GoogleGenAI({ apiKey });
  }, []);

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(list);
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
      setUploaded((prev) => [...prev, ...up]); // IMPORTANT
      setResponseText(`Lastet opp ${uploaded.length} fil(er). Klar for å bruke Gemini.`);
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
    if (!jobAdText.trim()) {
      setResponseText("Lim inn en jobbannonse først.");
      return;
    }

    setLoading(true);
    setResponseText("");

    try {
      // gemini analyserer jobbannonsen
      const jobPrompt = buildJobAdProfilePrompt(jobAdText);
      const jobProfileText = await generateFromGeminiText({
        ai,
        model: "gemini-2.5-flash",
        prompt: jobPrompt,
      });
      const jobProfile = parseJobProfile(jobProfileText);

      // evaluerer hver CV opp mot jobbannonse
      const evals: CandidateEval[] = [];
      for (const f of uploaded) {
        const evalPrompt = buildCandidateEvalPrompt({
          jobProfile,
          candidateId: f.uploadId,
          candidateLabel: f.displayName,
        });

        const evalText = await generateFromGeminiOnFiles({
          ai,
          model: "gemini-2.5-flash",
          files: [f],
          prompt: evalPrompt,
          labelFiles: false,
        });

        try {
          evals.push(parseCandidateEval(evalText));
        } catch (err) {
          console.error("Feil dukket opp i parsing av CV:", evalText);
          throw err;
        }
      }

      const rankPrompt = buildRankingPrompt({ jobProfile, evals });
      const rankText = await generateFromGeminiText({
        ai,
        model: "gemini-2.5-flash",
        prompt: rankPrompt,
      });

      const ranking = parseRanking(rankText);

      setResponseText(JSON.stringify({ jobProfile, evals, ranking }, null, 2));
    } catch (err) {
      setResponseText(`KI generering feilet: ${(err as Error).message}`);
    } finally {
      deleteGeminiFiles(ai, uploaded).catch((err) => {
        console.warn("Sletting av filer feilet:", err);
      });
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen p-6 flex flex-col justify-center items-center gap-4">
      <div className="flex flex-col gap-2 max-w-xl">
        <Field>
          <FieldLabel>Jobbannonse</FieldLabel>
          <Textarea
            className="border rounded p-2 min-h-[120px]"
            placeholder="Lim inn jobbannonse her..."
            value={ jobAdText }
            onChange={ (e) => setJobAdText(e.target.value) }
          />
          <FieldDescription>Lim inn jobbannonse her</FieldDescription>
        </Field>

        <Field className="flex flex-col w-fit p-2" >
          <FieldLabel className="break-all">CVer</FieldLabel>
          <Input
            className="border-2 w-fit p-2"
            type="file"
            accept="application/pdf"
            multiple
            onChange={ onPickFiles }
          />
          <FieldDescription>Trykk 'browse' for å laste opp en eller flere CVer</FieldDescription>
        </Field>

        <ButtonGroup className="flex gap-2">
          <Button onClick={ onUpload } disabled={ loading || selectedFiles.length === 0 }>
            { loading ? "Jobber..." : "Last opp filer til Gemini" }
          </Button>

          <Button onClick={ onAsk } disabled={ loading || uploaded.length === 0 || !jobAdText.trim() }>
            { loading ? "Jobber..." : "Screen" }
          </Button>
        </ButtonGroup>

        <div className="text-sm text-muted-foreground">
          Valgte filer: { selectedFiles.length } - Lastet opp: { uploaded.length }
        </div>
      </div>

      <div className="border rounded p-4 whitespace-pre-wrap flex-1 max-w-5xl w-4xl overflow-auto">
        { responseText || "Gemini respons vil dukke opp her..." }
      </div>
    </div>
  );
}

export default GeminiTestPage;