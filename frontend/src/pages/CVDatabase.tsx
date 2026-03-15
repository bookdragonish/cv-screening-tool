import { useFetchCandidates } from "@/hooks/useFetchCandidates";
import { useState } from "react";
import PdfPreviewOverlay from "../components/PdfPreviewOverlay";
import { AddNewCVModal } from "@/components/AddNewCv/AddNewCVModal";
import { Spinner } from "@/components/ui/spinner";
import type { CandidatePreview } from "@/types/candidate";
import ErrorBox from "@/components/ErrorBox";
import Breadcrumbs from "@/components/Breadcrumbs";
import Searchbar from "@/components/Searchbar";
import CandidateTable from "@/components/CVDatabase/CandidateTable";

function CVDatabase() {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, isError, isLoading } = useFetchCandidates(reloadKey);
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(null);   // Needed now for preview + rendering

  if (isError) {
    return (
      <section className="w-full flex justify-center my-10">
        <ErrorBox
          title={"Kan ikke hente kandidater"}
          message={"Prøv å refresh eller sjekke internet tilkoblingen"}
        />
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <main className="flex justify-center items-center h-170">
        <Spinner />
      </main>
    );
  }

  const filtered = data.filter((c) =>
    (c.name ?? c.id.toString()).toLowerCase().includes(search.toLowerCase()),
  );

  const candidates: CandidatePreview[] = filtered
    // only include candidates that actually have a CV
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name ?? `Candidate ${candidate.id}`,
    }));

  return (
    <main className="mx-auto max-w-7xl bg-gray-50 px-4 py-6 sm:px-8">

      <Breadcrumbs second_site_name={"Kandidater"}></Breadcrumbs>

      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <article>
          <h1 className="text-2xl font-bold text-gray-900">Kandidater</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administrer ansattes CV-er for screening.
          </p>
        </article>
        <AddNewCVModal onCreated={() => setReloadKey((k) => k + 1)} />
      </section>

      <Searchbar searchQuery={search} setSearchQuery={setSearch} searchAttribute={"navn"}/>

      <CandidateTable filteredData={filtered} setPreviewId={setPreviewId} setReloadKey={setReloadKey} dataLength={data.length}/>

      {/* Rendering PDF view */}
      {previewId != null && (
        <PdfPreviewOverlay
          candidates={candidates}
          initialId={previewId}
          onClose={() => setPreviewId(null)}
        />
      )}
    </main>
  );
}

export default CVDatabase;
