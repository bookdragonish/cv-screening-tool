import { useState, type ChangeEvent } from 'react'

function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (event.target.files && event.target.files.length > 0) {

      const selectedFiles = Array.from(event.target.files)
      const validFiles: File[] = []
      let foundError = false;

      for (let i = 0; i < selectedFiles.length; i++){
        const currentFile = selectedFiles[i];
        if (currentFile.type === "application/pdf"){
          validFiles.push(selectedFiles[i])
        } else {
          foundError = true;
        }

      }
      
      if (foundError){
        setError("OBS! Kun PDF-filer er tillatt!");
      }
      setFiles(prevFiles => [...prevFiles,...validFiles])
    }
  };
  
  return (
    <>
      <div className="w-full h-screen p-10">
        <label className="block mb-2 text-sm font-medium text-white">
          Upload resumes here:
        </label>
        <input
          type="file" accept="application/pdf" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-300 focus:outline-none"
        />

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            <p className="text-sm font-bold">⚠️ {error}</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <p className="font-bold mb-2">Valgte filer ({files.length}):</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              {files.map((file, index) => (
                <li key={index} className="text-sm italic">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
    
  )
}

export default Home;
