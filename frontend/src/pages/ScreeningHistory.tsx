import { Link } from "react-router";
import { Clock, FileText, Search } from 'lucide-react';
import React from "react";

function ScreeningHistory() {
	const ScreeningData = [
    {
	  id: 1,
      title: "Senior Utvikler",
      date: "28 Jan 2026",
	  topMatches: [
		{ candidateName: "Marius B", matchScore: 100 },
		{ candidateName: "Markus", matchScore: 92 },
		{ candidateName: "Ingvild", matchScore: 90 },
	  ],
    },
    {
	  id: 2,
      title: "Prosjektleder",
      date: "25 Jan 2026",
	  topMatches: [
		{ candidateName: "Marius B", matchScore: 100 },
		{ candidateName: "Baris", matchScore: 91 },
		{ candidateName: "Marius F", matchScore: 89 },
	  ],
    },
    {
	  id: 3,
      title: "Grafisk Designer",
      date: "22 Jan 2026",
	  topMatches: [
		{ candidateName: "Marius B", matchScore: 100 },
		{ candidateName: "Helene", matchScore: 90 },
		{ candidateName: "Moa", matchScore: 88 },
	  ],
    },
    {
	  id: 4,
      title: "Dataanalytiker",
      date: "20 Jan 2026",
	  topMatches: [
		{ candidateName: "Marius B", matchScore: 100 },
		{ candidateName: "Ingvild", matchScore: 89 },
		{ candidateName: "Markus", matchScore: 87 },
	  ],
    },
    {
	  id: 5,
      title: "Systemadministrator",
      date: "18 Jan 2026",
	  topMatches: [
		{ candidateName: "Marius B", matchScore: 100 },
		{ candidateName: "Moa", matchScore: 88 },
		{ candidateName: "Baris", matchScore: 86 },
	  ],
    },
  ];

  var [searchQuery, setSearchQuery] = React.useState("");

  const filteredHistory = ScreeningData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen px-8 py-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-(--color-dark) opacity-75">
		<Link to="/" className="cursor-pointer transition-opacity hover:opacity-75">Hjem</Link>
        <span>›</span>
        <span className="text-(--color-dark)">Screeninghistorikk</span>
      </nav>

		<div className="min-h-screen">
			<div className="mb-6">
			<h1 className="text-3xl font-semibold text-(--color-dark)">Screeninghistorikk</h1>
			<p className="mt-2 text-(--color-dark) opacity-75">Få oversikt over tidligere CV-screeningsresultater</p>
			</div>

			<div className="mb-6">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-(--color-dark) opacity-50" />
				<input
				type="text"
				placeholder="Søk etter jobbtittel..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="w-full rounded-lg border border-(--color-primary) py-3 pr-4 pl-10 text-(--color-dark) outline-none focus:ring-2 focus:ring-(--color-primary)"
				/>
			</div>
			</div>

			<div className="space-y-4">
			{filteredHistory.map((screening) => (
				<div key={screening.id} className="rounded-lg border border-(--color-primary) bg-(--color-white) p-6 shadow-sm transition-colors hover:bg-(--color-light)/40">
				<div className="flex items-start justify-between">
					<div className="flex-1">
					<div className="flex items-start space-x-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--color-light)">
						<FileText className="h-5 w-5 text-(--color-primary)" />
						</div>
						<div className="flex-1">
						<h3 className="text-lg font-semibold text-(--color-dark)">{screening.title}</h3>
						<div className="mt-2 flex items-center space-x-4 text-sm text-(--color-dark) opacity-75">
							<span className="flex items-center">
							<Clock className="h-4 w-4" />
							<span>{screening.date}</span>
							</span>
						</div>
						
						<div className="mt-4">
							<p className="mb-2 text-sm font-medium text-(--color-dark)">Top 3 kandidater:</p>
							<div className="flex flex-wrap gap-2">
							{screening.topMatches.slice(0, 3).map((match, index) => (
								<span 
								key={index}
								className="inline-flex items-center rounded-full bg-(--color-light) px-3 py-1 text-xs font-medium text-(--color-dark)"
								>
								#{index + 1} {match.candidateName} ({match.matchScore}%)
								</span>
							))}
							</div>
						</div>
						</div>
					</div>
					</div>

					<button
					onClick={() => console.log("Se resultater for ID: " + screening.id)}
					className="ml-4 whitespace-nowrap rounded-lg bg-(--color-primary) px-4 py-2 font-medium text-(--color-white) transition-opacity hover:opacity-90"
					>
					Se resultater
					</button>
				</div>
				</div>
			))}
			</div>

			{filteredHistory.length === 0 && (
			<div className="rounded-lg border border-(--color-primary) bg-(--color-white) p-12 text-center shadow-sm">
				<FileText className="mx-auto mb-4 h-16 w-16 text-(--color-primary) opacity-60" />
				<h3 className="mb-2 text-lg font-semibold text-(--color-dark)">Ingen screeningresultater funnet for søket ditt</h3>
				<p className="text-sm text-(--color-dark) opacity-75">Prøv å justere søket ditt</p>
			</div>
			)}
		</div>
	 </main>
  );
}
export default ScreeningHistory;