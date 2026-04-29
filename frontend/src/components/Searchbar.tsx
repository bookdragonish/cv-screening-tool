import { Search } from "lucide-react";
import { useId } from "react";

type SearchbarParameters = {
    searchAttribute: "navn" | "jobbtittel",
    searchQuery: string,
    setSearchQuery: (value: string) => void
}

function Searchbar({searchQuery, setSearchQuery, searchAttribute}: SearchbarParameters) {
  const searchInputId = useId();

  return (
    <section role="search" className="mb-6 relative bg-white">
      <label htmlFor={searchInputId} className="sr-only">
        Søk etter {searchAttribute}
      </label>
      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-(--color-dark) opacity-50"
        aria-hidden="true"
      />
      <input
        id={searchInputId}
        type="text"
        placeholder={"Søk etter " + searchAttribute + "..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg border border-(--color-primary) py-3 pr-4 pl-10 text-(--color-dark) outline-none focus:ring-2 focus:ring-(--color-primary)"
      />
    </section>
  );
}export default Searchbar;
