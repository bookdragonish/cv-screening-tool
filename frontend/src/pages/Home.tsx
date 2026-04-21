import { Link } from "react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFetchCandidates } from "@/hooks/useFetchCandidates";
import HeaderSection from "@/components/HeaderSection";
import ScanningHistoryTable from "@/components/HomePage/ScanningHistoryTable";

function Home() {
  const { data: candidatesData } = useFetchCandidates();

  const activeCvCount = candidatesData?.length ?? 0;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
    >

      {/* Left column - actions */}
      <aside className="space-y-6 mt-5" aria-label="Screeninghandlinger">
        <HeaderSection
          header={"Velkommen tilbake!"}
          subsection={
            "Her kan du se oversikten over de siste skanningene gjennomført, administrere kandidatene eller starte ny skanning."
          }
        />

        <span className="block h-1 border-b border-(--color-primary)"></span>

        {/* Start new screening card */}
        <Card className="rounded-lg border-(--color-primary) bg-(--color-primary) p-6 shadow-sm">
          <h2 className=" text-xl font-semibold text-white">
            Start ny skanning
          </h2>
          <p className="text-sm text-white opacity-90 mb-2">
            Last opp en stillingsbeskrivelse for å finne de mest relevante
            kandidatene.
          </p>

          <Button
            asChild
            className="w-full border-2 border-white hover-dark-button"
          >
            <Link
              to="/ny-skanning"
              className="flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ny skanning
            </Link>
          </Button>
        </Card>

        {/* CV database card */}
        <Card
          className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm"
          aria-label="Kandidatdatabase"
        >
          <div className=" flex items-center gap-3">
            <div className="rounded-lg bg-(--color-light) p-2">
              <FileText
                className="h-5 w-5 text-(--color-dark)"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="font-semibold text-(--color-dark)">Kandidater</h3>
              <p className="mt-1 text-sm text-(--color-dark) opacity-75">
                {activeCvCount} aktive kandidater
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="w-full border-(--color-primary) font-medium text-(--color-primary) transition-colors hover:bg-(--color-light)/50 hover:text-(--color-primary)"
          >
            <Link to="/kandidater">Administrer kandidater → </Link>
          </Button>
        </Card>
      </aside>

      <ScanningHistoryTable />
    </main>
  );
}

export default Home;
