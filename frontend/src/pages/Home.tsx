import { Link } from "react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFetchCandidates } from "@/hooks/useFetchCandidates";
import HeaderSection from "@/components/HeaderSection";
import EarlierScanningTable from "@/components/HomePage/EarlierScanningTable";

function Home() {

  const { data: candidatesData } = useFetchCandidates();

  const activeCvCount = candidatesData?.length ?? 0;

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-8">
      <HeaderSection
        header={"Oversikt"}
        subsection={
          "Velkommen tilbake! Her er en oversikt over dine CV-skanningsaktiviteter."
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      <EarlierScanningTable />

        {/* Right column - actions */}
        <aside className="space-y-6" aria-label="Screeninghandlinger">
          {/* Start new screening card */}
          <Card className="rounded-lg border-(--color-primary) bg-(--color-primary) p-6 shadow-sm">
            <h3 className="mb-2 text-xl font-semibold text-white">
              Start ny screening
            </h3>
            <p className="mb-6 text-sm text-white opacity-90">
              Last opp en stillingsbeskrivelse for å matche kandidater fra
              CV-databasen
            </p>
            <Button
              asChild
              className="w-full border-2 border-white bg-transparent font-medium text-white transition-all hover:bg-white hover:text-(--color-primary) focus-visible:bg-white focus-visible:text-(--color-primary)"
            >
              <Link
                to="/new-screening"
                className="flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Start screening
              </Link>
            </Button>
          </Card>

          {/* CV database card */}
          <section
            className="rounded-lg border border-(--color-primary) bg-white p-6 shadow-sm"
            aria-label="Kandidatdatabase"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-(--color-light) p-2">
                <FileText
                  className="h-5 w-5 text-(--color-dark)"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-semibold text-(--color-dark)">
                  Kandidater
                </h3>
                <p className="mt-1 text-sm text-(--color-dark) opacity-75">
                  {activeCvCount} aktive CVer
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full border-(--color-primary) font-medium text-(--color-primary) transition-colors hover:bg-(--color-light)/50"
            >
              <Link to="/kandidater">Administrer CVer</Link>
            </Button>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default Home;
