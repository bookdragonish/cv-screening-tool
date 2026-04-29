import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// defines the layers of the breadcrumb, first site is always home
type BreadcrumbsProps = {
  second_site_name: string;
  second_site_link?: string;
  third_site_name?: string;
};

function Breadcrumbs({
  second_site_name,
  second_site_link,
  third_site_name,
}: BreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList className="gap-2 text-sm text-slate-500">
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="hover:text-slate-700">
            <Link to="/">Hjem</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-slate-400" />

        {third_site_name && second_site_link ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-slate-700">
                <Link to={second_site_link}>{second_site_name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="text-slate-400" />

            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-slate-700">
                {third_site_name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-slate-700">
              {second_site_name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
