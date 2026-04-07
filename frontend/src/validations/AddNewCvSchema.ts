import * as z from "zod"

const MAX_PDF_BYTES = 10 * 1024 * 1024
const PDF_FILE_EXTENSION = ".pdf"

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(PDF_FILE_EXTENSION)
  )
}

const AddNewCvSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Navn må være minst 2 tegn.")
    .max(80, "Navn kan ikke være lengre enn 80 tegn."),

  cv: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Du må laste opp en CV (PDF).",
    })
    .refine((file) => !file || isPdfFile(file), {
      message: "CV må være en PDF.",
    })
    .refine((file) => !file || file.size <= MAX_PDF_BYTES, {
      message: "PDFen er for stor (maks 10MB).",
    }),
    
  aml46: z
    .boolean(),

  aml47: z
    .boolean(),
})

type AddNewCvValues = z.infer<typeof AddNewCvSchema>

export { MAX_PDF_BYTES, AddNewCvSchema, isPdfFile, type AddNewCvValues}
