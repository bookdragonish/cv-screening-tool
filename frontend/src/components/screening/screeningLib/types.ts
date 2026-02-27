export type ScreeningView = "upload" | "processing" | "results" | "candidate";

export type StepStatus = "active" | "completed" | "upcoming";

export type ScreeningCandidate = {
  id: number;
  rank: number;
  name: string;
  role: string;
  score: number;
  met: string[];
  missing: string[];
  summary: string;
  experience: string[];
  education: string[];
  email: string;
  phone: string;
};
