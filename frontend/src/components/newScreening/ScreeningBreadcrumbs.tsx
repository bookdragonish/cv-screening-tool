import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type ScreeningBreadcrumbsProps = {
  current: "new-screening" | "results" | "candidate";
  canGoToResults: boolean;
  candidateName?: string;
};

function ScreeningBreadcrumbs({
  current,
  canGoToResults,
  candidateName,
}: ScreeningBreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList className="gap-2 text-sm text-slate-500">
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="hover:text-slate-700">
            <Link to="/">Hjem</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-slate-400" />

        <BreadcrumbItem>
          {current === "new-screening" ? (
            <BreadcrumbPage className="font-medium text-slate-700">Ny screening</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild className="hover:text-slate-700">
              <Link to="/new-screening">Ny screening</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-slate-400" />

        <BreadcrumbItem>
          {current === "results" ? (
            <BreadcrumbPage className="font-medium text-slate-700">Resultater</BreadcrumbPage>
          ) : canGoToResults ? (
            <BreadcrumbLink asChild className="hover:text-slate-700">
              <Link to="/new-screening/results">Resultater</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-slate-400">Resultater</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {current === "candidate" && candidateName ? (
          <>
            <BreadcrumbSeparator className="text-slate-400" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-700">{candidateName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default ScreeningBreadcrumbs;
