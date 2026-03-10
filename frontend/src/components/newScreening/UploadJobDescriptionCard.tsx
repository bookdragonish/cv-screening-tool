import { zodResolver } from "@hookform/resolvers/zod";
import { FileTextIcon, UploadIcon } from "lucide-react";
import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  MAX_JOB_DESCRIPTION_PDF_BYTES,
  MAX_JOB_DESCRIPTION_TEXT_LENGTH,
  UploadJobDescriptionSchema,
  type JobDescriptionInput,
  type UploadJobDescriptionValues,
  toJobDescriptionInput,
} from "@/validations/UploadJobDescriptionSchema";
import { formatBytes } from "@/utils/newScreeningUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UploadJobDescriptionCardProps = {
  initialInput: JobDescriptionInput | null;
  showRetryLabel: boolean;
  onCancel: () => void;
  onStartProcessing: (input: JobDescriptionInput) => void | Promise<void>;
};

function UploadJobDescriptionCard({
  initialInput,
  showRetryLabel,
  onCancel,
  onStartProcessing,
}: UploadJobDescriptionCardProps) {
  const form = useForm<UploadJobDescriptionValues>({
    resolver: zodResolver(UploadJobDescriptionSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: {
      mode: initialInput?.mode ?? "pdf",
      jobDescriptionFile: initialInput?.mode === "pdf" ? initialInput.file : undefined,
      jobDescriptionText: initialInput?.mode === "text" ? initialInput.text : "",
    },
  });

  useEffect(() => {
    form.reset({
      mode: initialInput?.mode ?? "pdf",
      jobDescriptionFile: initialInput?.mode === "pdf" ? initialInput.file : undefined,
      jobDescriptionText: initialInput?.mode === "text" ? initialInput.text : "",
    });
  }, [initialInput, form]);

  const mode = form.watch("mode");
  const selectedFile = form.watch("jobDescriptionFile");
  const jobDescriptionText = form.watch("jobDescriptionText") ?? "";
  const isPdfSelectionValid =
    selectedFile !== undefined &&
    selectedFile.type === "application/pdf" &&
    selectedFile.size <= MAX_JOB_DESCRIPTION_PDF_BYTES;

  const uid = useId();
  const fileInputId = `screening-job-description-file-${uid}`;
  const fileErrorId = `screening-job-description-file-error-${uid}`;
  const textAreaId = `screening-job-description-text-${uid}`;
  const textErrorId = `screening-job-description-text-error-${uid}`;

  const setPickedFile = (file: File | undefined) => {
    form.setValue("jobDescriptionFile", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const setMode = (nextMode: "pdf" | "text") => {
    if (nextMode === mode) return;

    form.setValue("mode", nextMode, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    if (nextMode === "pdf") {
      form.setValue("jobDescriptionText", "", {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    } else {
      form.setValue("jobDescriptionFile", undefined, {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    form.clearErrors();
  };

  const isSubmitDisabled =
    mode === "pdf" ? !isPdfSelectionValid : jobDescriptionText.trim().length === 0;

  return (
    <Card className="mt-6 gap-0 px-2 border-slate-200 bg-white">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-3xl text-slate-900">Last opp stillingsbeskrivelse</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Last opp en PDF eller lim inn stillingsbeskrivelsen for å starte screeningprosessen.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "pdf" ? "default" : "outline"}
              className={mode === "pdf" ? "bg-primary hover:bg-primary/80" : "border-slate-300 bg-white hover:bg-slate-500"}
              onClick={() => setMode("pdf")}
            >
              PDF
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "text" ? "default" : "outline"}
              className={mode === "text" ? "bg-primary hover:bg-primary/80" : "border-slate-300 bg-white hover:bg-slate-500"}
              onClick={() => setMode("text")}
            >
              Tekst
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => {
            onStartProcessing(toJobDescriptionInput(values));
          })}
        >
          {mode === "pdf" ? (
            <Controller
              name="jobDescriptionFile"
              control={form.control}
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor={fileInputId} className="sr-only">
                    Stillingsbeskrivelse PDF
                  </Label>

                  <Input
                    id={fileInputId}
                    type="file"
                    accept="application/pdf, .pdf"
                    className="sr-only"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? fileErrorId : undefined}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setPickedFile(file);
                      event.target.value = "";
                    }}
                  />

                  <div className="rounded-lg border border-dashed border-slate-300 px-6 min-h-52 mt-7 py-12 text-center transition">
                    <UploadIcon className="mx-auto h-14 w-14 text-primary" />

                    {isPdfSelectionValid ? (
                      <div className="mt-4 text-center">
                        <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
                          <FileTextIcon className="h-4 w-4 text-primary" />
                          {selectedFile?.name}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">{formatBytes(selectedFile?.size ?? 0)}</p>
                        <Button
                          variant="ghost"
                          type="button"
                          className="mt-2 text-sm text-red-500 hover:text-red-600"
                          onClick={() => setPickedFile(undefined)}
                        >
                          Fjern fil
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-600">
                        Velg en PDF-fil, eller{" "}
                        <Label
                          htmlFor={fileInputId}
                          className="inline cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          bla gjennom filer
                        </Label>
                      </p>
                    )}
                  </div>

                  {!fieldState.invalid && <FieldDescription className="mt-2">Kun PDF-filer er tillat</FieldDescription>}

                  {fieldState.invalid && (
                    <div id={fileErrorId}>
                      <FieldError errors={[fieldState.error]} className="mt-3" />
                    </div>
                  ) }
                </Field>
              )}
            />
          ) : (
            <Controller
              name="jobDescriptionText"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor={textAreaId}>Stillingsbeskrivelse (tekst)</Label>
                  <Textarea
                    {...field}
                    id={textAreaId}
                    className="min-h-52 text-foreground rounder-lg"
                    placeholder="Lim inn stillingsbeskrivelsen her..."
                    maxLength={MAX_JOB_DESCRIPTION_TEXT_LENGTH}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? textErrorId : undefined}
                  />
                  <FieldDescription>
                    Lim inn hele stillingsbeskrivelsen. Minst 40 tegn, maks{" "}
                    {MAX_JOB_DESCRIPTION_TEXT_LENGTH.toLocaleString()} tegn.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <div id={textErrorId}>
                      <FieldError errors={[fieldState.error]} className="mt-1" />
                    </div>
                  )}
                </Field>
              )}
            />
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 bg-white hover:bg-slate-500"
              onClick={() => {
                setPickedFile(undefined);
                form.setValue("jobDescriptionText", "", {
                  shouldDirty: true,
                  shouldTouch: false,
                  shouldValidate: false,
                });
                form.setValue("mode", "pdf", {
                  shouldDirty: true,
                  shouldTouch: false,
                  shouldValidate: false,
                });
                onCancel();
              }}
            >
              Avbryt
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/80" disabled={isSubmitDisabled}>
              {showRetryLabel ? "Prøv igjen" : "Neste"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default UploadJobDescriptionCard;
