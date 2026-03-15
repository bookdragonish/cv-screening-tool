import { Search } from "lucide-react";

type SearchbarParameters = {
    searchAttribute: "navn" | "jobbtittel",
    searchQuery: string,
    setSearchQuery: (value: string) => void
}

function Searchbar({searchQuery, setSearchQuery, searchAttribute}: SearchbarParameters) {
  return (
    <div className="mb-6 relative bg-white">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-(--color-dark) opacity-50" />
      <input
        type="text"
        placeholder={"Søk etter " + searchAttribute + "..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg border border-(--color-primary) py-3 pr-4 pl-10 text-(--color-dark) outline-none focus:ring-2 focus:ring-(--color-primary)"
      />
    </div>
  );
}export default Searchbar;
