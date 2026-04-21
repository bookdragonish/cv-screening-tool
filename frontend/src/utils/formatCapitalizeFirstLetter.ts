
export function formatCapitalizeFirstLetter(string: string){
    if (!string) return string;
    const formatedString = string.charAt(0).toUpperCase() + string.slice(1);
    return formatedString;
}