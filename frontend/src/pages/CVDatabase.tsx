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
import HeaderSection from "@/components/HeaderSection";

function CVDatabase() {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, isError, isLoading } = useFetchCandidates(reloadKey);
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<number | null>(null);

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
      <main id="main-content" className="flex h-170 items-center justify-center" aria-busy="true" aria-live="polite">
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
    <main id="main-content" className="mx-auto max-w-7xl p-6">
      <Breadcrumbs second_site_name={"Kandidater"} />

      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderSection
          header={"Kandidater"}
          subsection={"Administrer ansattes informasjon og CV-er for skanninger."}
        />
        <AddNewCVModal onCreated={() => setReloadKey((k) => k + 1)} />
      </section>

      <Searchbar
        searchQuery={search}
        setSearchQuery={setSearch}
        searchAttribute={"navn"}
      />
      <CandidateTable
        filteredData={filtered}
        setPreviewId={setPreviewId}
        setReloadKey={setReloadKey}
        dataLength={data.length}
      />
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
