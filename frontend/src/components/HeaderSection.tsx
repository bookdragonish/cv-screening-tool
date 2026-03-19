type HeaderProps={
    header: string,
    subsection: string,
}

function HeaderSection({header, subsection}: HeaderProps) {
  return (
    <section className="mb-6">
      <h1 className="text-3xl font-semibold text-(--color-dark)">
        {header}
      </h1>
      <p className="mt-2 text-(--color-dark) opacity-75">
        {subsection}
      </p>
    </section>
  );
}
export default HeaderSection;
