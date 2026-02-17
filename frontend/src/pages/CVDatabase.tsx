import { useState, type ChangeEvent } from 'react'
import { validatePdfUpload } from '@/utils/fileValidation';

function CVDatabase() {
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null)
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		setError(null);
		if (event.target.files && event.target.files.length > 0) {
			const incomingFiles = Array.from(event.target.files)

			const { validFiles, foundError } = validatePdfUpload(incomingFiles, files)

			if (foundError) {
				setError("OBS! Kun PDF-filer er tillatt!");
			}
			setFiles(prevFiles => [...prevFiles, ...validFiles])
		}
	};
	return (
		<main className="max-w-7xl mx-auto px-6 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-slate-900 mb-2">CV-database</h1>
				<p className="text-slate-700 font-medium mb-4">
					Last opp CVene dine her:
				</p>
				<input
					type="file" accept="application/pdf" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-300 focus:outline-none"
				/>
				{error && (
					<div className="mt-4 p-3 bg-chart-5 border border-destructive card rounded-lg text-white">
						<p className="text-sm font-bold">{error}</p>
					</div>
				)}
				{files.length > 0 && (
					<div className="mt-6 p-4 bg-chart-1 border border-border rounded-lg shadow-sm text-white">
						<p className="font-bold mb-2">Valgte filer ({files.length}):</p>
						<ul className="list-disc pl-5 space-y-1 text-card-foreground">
							{files.map((file, index) => (
								<li key={index} className="text-sm italic">
									{file.name}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</main>
	);
}

export default CVDatabase;