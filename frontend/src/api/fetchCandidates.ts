const API_URL = "http://localhost:3000/api/candidates"


async function getAllCandidates() {
    const response = await fetch(API_URL);
    if(!response.ok){
        throw new Error(`Response Status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
    return result;
} export default getAllCandidates;