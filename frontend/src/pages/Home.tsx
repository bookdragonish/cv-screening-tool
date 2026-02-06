import { useFetchCandidate, useFetchCandidates } from "@/hooks/useFetchCandidates";

function Home() {
  const { data, isError, isLoading } = useFetchCandidate("1");

  console.log(data, isError, isLoading);

  return (
    <>
      <div className="w-full h-screen p-10">
        <label className="block mb-2 text-sm font-medium text-white">
          Upload resumes here:
        </label>
        <input 
          type="file" accept="application/pdf" className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-300 focus:outline-none multiple"
        />
      </div>
    </>
  )
}

export default Home;
