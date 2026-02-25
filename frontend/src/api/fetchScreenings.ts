export type ScreeningDetails = {
  jobPostId: number;
  title: string;
  screenedAt: string;
  candidates: Array<{
    candidateId: number;
    candidateName: string;
    rank: number;
    score: number;
    qualified: boolean;
    qualificationsMet: string[];
    qualificationsMissing: string[];
    summary?: string;
    createdAt: string;
  }>;
};

const MOCK_SCREENING_DETAILS: ScreeningDetails[] = [
  {
    jobPostId: 1,
    title: "Senior Utvikler",
    screenedAt: "2026-01-28T10:00:00.000Z",
    candidates: [
      {
        candidateId: 101,
        candidateName: "Marius B",
        rank: 1,
        score: 100,
        qualified: true,
        qualificationsMet: ["TypeScript", "React", "Node.js"],
        qualificationsMissing: [],
        summary: "Sterk fullstack-profil med relevant erfaring.",
        createdAt: "2026-01-28T10:00:00.000Z",
      },
      {
        candidateId: 102,
        candidateName: "Markus",
        rank: 2,
        score: 92,
        qualified: true,
        qualificationsMet: ["TypeScript", "React"],
        qualificationsMissing: ["Node.js"],
        summary: "God frontend-kompetanse",
        createdAt: "2026-01-28T10:00:00.000Z",
      },
      {
        candidateId: 103,
        candidateName: "Ingvild",
        rank: 3,
        score: 90,
        qualified: true,
        qualificationsMet: ["React", "Node.js"],
        qualificationsMissing: ["TypeScript"],
        summary: "Solid kandidat",
        createdAt: "2026-01-28T10:00:00.000Z",
      },
    ],
  },
  {
    jobPostId: 2,
    title: "Prosjektleder",
    screenedAt: "2026-01-25T10:00:00.000Z",
    candidates: [
      {
        candidateId: 101,
        candidateName: "Marius B",
        rank: 1,
        score: 100,
        qualified: true,
        qualificationsMet: ["Ledelse", "Planlegging", "Kommunikasjon"],
        qualificationsMissing: [],
        summary: "Svært sterk kandidat for prosjektlederrollen.",
        createdAt: "2026-01-25T10:00:00.000Z",
      },
      {
        candidateId: 104,
        candidateName: "Baris",
        rank: 2,
        score: 91,
        qualified: true,
        qualificationsMet: ["Ledelse", "Kommunikasjon"],
        qualificationsMissing: ["Budsjettstyring"],
        summary: "God profil",
        createdAt: "2026-01-25T10:00:00.000Z",
      },
      {
        candidateId: 105,
        candidateName: "Marius F",
        rank: 3,
        score: 89,
        qualified: false,
        qualificationsMet: ["Planlegging"],
        qualificationsMissing: ["Ledelse", "Kommunikasjon"],
        summary: "Potensiale",
        createdAt: "2026-01-25T10:00:00.000Z",
      },
    ],
  },
];

export async function getScreeningHistory(): Promise<ScreeningDetails[]> {
  return MOCK_SCREENING_DETAILS;
}

export async function getScreeningByJobPostId(
  jobPostId: number,
): Promise<ScreeningDetails | null> {
  const detail = MOCK_SCREENING_DETAILS.find((item) => item.jobPostId === jobPostId) ?? null;
  return detail;
}