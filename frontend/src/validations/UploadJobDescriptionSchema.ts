import * as z from "zod";

const MAX_JOB_DESCRIPTION_PDF_BYTES = 10 * 1024 * 1024;
const MIN_JOB_DESCRIPTION_TEXT_LENGTH = 40;
const MAX_JOB_DESCRIPTION_TEXT_LENGTH = 12000;

type JobDescriptionInput =
  | { mode: "pdf"; file: File }
  | { mode: "text"; text: string };

const UploadJobDescriptionSchema = z
  .object({
    mode: z.enum(["pdf", "text"]),
    jobDescriptionFile: z
      .custom<File | undefined>((file) => file === undefined || file instanceof File, {
        message: "Ugyldig fil.",
      })
      .optional(),
    jobDescriptionText: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "pdf") {
      if (!values.jobDescriptionFile) {
        ctx.addIssue({
          code: "custom",
          message: "Du må laste opp en PDF med stillingsbeskrivelse.",
          path: ["jobDescriptionFile"],
        });
        return;
      }

      if (values.jobDescriptionFile.type !== "application/pdf") {
        ctx.addIssue({
          code: "custom",
          message: "Kun PDF-filer er tillatt.",
          path: ["jobDescriptionFile"],
        });
      }

      if (values.jobDescriptionFile.size > MAX_JOB_DESCRIPTION_PDF_BYTES) {
        ctx.addIssue({
          code: "custom",
          message: "PDF-filen er for stor (maks 10 MB).",
          path: ["jobDescriptionFile"],
        });
      }

      return;
    }

    const trimmedText = values.jobDescriptionText?.trim() ?? "";

    if (!trimmedText) {
      ctx.addIssue({
        code: "custom",
        message: "Du må lime inn en stillingsbeskrivelse.",
        path: ["jobDescriptionText"],
      });
      return;
    }

    if (trimmedText.length < MIN_JOB_DESCRIPTION_TEXT_LENGTH) {
      ctx.addIssue({
        code: "custom",
        message: `Stillingsbeskrivelsen må være minst ${MIN_JOB_DESCRIPTION_TEXT_LENGTH} tegn.`,
        path: ["jobDescriptionText"],
      });
    }

    if (trimmedText.length > MAX_JOB_DESCRIPTION_TEXT_LENGTH) {
      ctx.addIssue({
        code: "custom",
        message: `Stillingsbeskrivelsen kan ikke overstige ${MAX_JOB_DESCRIPTION_TEXT_LENGTH} tegn.`,
        path: ["jobDescriptionText"],
      });
    }
  });

type UploadJobDescriptionValues = z.infer<typeof UploadJobDescriptionSchema>;

function toJobDescriptionInput(values: UploadJobDescriptionValues): JobDescriptionInput {
  if (values.mode === "pdf") {
    return {
      mode: "pdf",
      file: values.jobDescriptionFile as File,
    };
  }

  return {
    mode: "text",
    text: (values.jobDescriptionText ?? "").trim(),
  };
}

export {
  MAX_JOB_DESCRIPTION_PDF_BYTES,
  MIN_JOB_DESCRIPTION_TEXT_LENGTH,
  MAX_JOB_DESCRIPTION_TEXT_LENGTH,
  UploadJobDescriptionSchema,
  toJobDescriptionInput,
  type UploadJobDescriptionValues,
  type JobDescriptionInput,
};
