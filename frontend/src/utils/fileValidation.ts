export function validatePdfUpload(selectedFiles: File[], existingFiles: File[]) {

    const validFiles: File[] = []
    let foundError = false;

    for (let i = 0; i < selectedFiles.length; i++) {
        const currentFile = selectedFiles[i];

        if (currentFile.type === "application/pdf") {
            const alreadyExists = existingFiles.some(existingFile =>
                existingFile.name === currentFile.name && existingFile.size === currentFile.size
            )
            if (!alreadyExists) {
                validFiles.push(selectedFiles[i])
            }
        } else {
            foundError = true;
        }

    }
    return { validFiles, foundError };

}