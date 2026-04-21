type HeaderProps={
    header: string,
    subsection: string,
    id?: string;
}

function HeaderSection({header, subsection, id}: HeaderProps) {
  return (
    <header className="mb-6">
      <h1 id={id} className="text-3xl font-semibold text-(--color-dark)">
        {header}
      </h1>
      <p className="mt-2 text-(--color-dark) opacity-75">
        {subsection}
      </p>
    </header>
  );
}
export default HeaderSection;
