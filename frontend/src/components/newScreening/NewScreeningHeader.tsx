import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

function NewScreeningHeader() {
  return (
      <header>
        <Item className="gap-0 p-0" size="default" variant="default">
          <ItemContent className="gap-0">
            <ItemTitle id="new-screening-title" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ny screening</ItemTitle>
            <ItemDescription className="mt-2 line-clamp-none text-base text-slate-500">
              Last opp en stillingsbeskrivelse for å matche kandidater fra CV-databasen
            </ItemDescription>
          </ItemContent>
        </Item>
      </header>
  
  );
}

export default NewScreeningHeader;
