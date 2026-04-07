import {
  AddNewCvSchema,
  MAX_PDF_BYTES,
  isPdfFile,
  type AddNewCvValues,
} from "@/validations/AddNewCvSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useId, useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { API_URL } from "@/utils/variables"
import type { Candidate } from "@/types/candidate"

type AddNewCVModalProps = {
  onCreated?: () => void
  onDelete?: (id: number, name: string) => Promise<Boolean>
  candidateToEdit?: Partial<Candidate>
  customTrigger?: React.ReactNode
}
function AddNewCVModal({ onCreated, onDelete, candidateToEdit, customTrigger }: AddNewCVModalProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = !!candidateToEdit
  const form = useForm<AddNewCvValues>({
    resolver: zodResolver(AddNewCvSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: {
      name: candidateToEdit?.name ?? "",
      cv: undefined as unknown as File,
      aml46: false,
      aml47: false,
      ansiennitet: null,
    },
  })

  useEffect(() => {
    if (candidateToEdit) {
      form.reset({
        name: candidateToEdit.name ?? "",
        cv: undefined,
        aml46: false,
        aml47: false,
        ansiennitet: null,
      })
    }
  }, [candidateToEdit, form])

  const selectedCv = form.watch("cv")
  const isCvSelectionValid = isEditing
    ? !selectedCv || (
      selectedCv instanceof File &&
      isPdfFile(selectedCv) &&
      selectedCv.size <= MAX_PDF_BYTES
    ) : selectedCv instanceof File && isPdfFile(selectedCv) && selectedCv.size <= MAX_PDF_BYTES;

  const uid = useId()
  const nameDescId = `add-cv-name-desc-${uid}`
  const nameErrId = `add-cv-name-err-${uid}`
  const cvDescId = `add-cv-pdf-desc-${uid}`
  const cvErrId = `add-cv-pdf-err-${uid}`
  const submitErrId = `add-cv-submit-err-${uid}`
  const amlGroupLabelId = `add-cv-aml-label-${uid}`
  const ansienitetDescId = `add-cv-ansiennitet-desc-${uid}`
  const ansienitetErrId = `add-cv-ansiennitet-err-${uid}`
  async function onSubmit(values: AddNewCvValues) {
    setSubmitError(null)
    if (!isEditing && !values.cv) {
      form.setError("cv", { message: "Du må laste opp CV for nye kandidater" })
      return
    }
    try {
      let targetId: number;
      if (isEditing && candidateToEdit?.id !== undefined) {
        const updateRes = await fetch(API_URL + `/api/candidates/${candidateToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            aml46: values.aml46,
            aml47: values.aml47,
            ansiennitet: values.ansiennitet,
          }),
        })
        if (!updateRes.ok) {
          const body = await safeJson(updateRes)
          throw new Error(body?.error ?? `Klarte ikke å oppdatere kandidaten (${updateRes.status})`)
        }
        targetId = candidateToEdit.id;
      }
      else {
        const createRes = await fetch(API_URL + "/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            cv_pdf: null,
            aml46: values.aml46,
            aml47: values.aml47,
            ansiennitet: values.ansiennitet,
          }),
        })
        if (!createRes.ok) {
          const body = await safeJson(createRes)
          throw new Error(body?.error ?? `Failed to create candidate (${createRes.status})`)
        }
        const created = (await createRes.json()) as { id: number }
        targetId = created.id;
      }
      if (values.cv) {
        const fd = new FormData()
        fd.append("cv", values.cv)
        const uploadRes = await fetch(
          API_URL + `/api/candidates/${targetId}/cv`,
          { method: "POST", body: fd },
        )
        if (!uploadRes.ok) {
          const body = await safeJson(uploadRes)
          throw new Error(body?.error ?? `CV opplastning feilet (${uploadRes.status})`)
        }
      }
      onCreated?.()
      setOpen(false)
      form.reset()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Noe gikk galt.")
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setSubmitError(null)
          form.reset()
        }
      }}
    >
      <DialogTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button className="bg-(--color-primary) hover:bg-white text-white hover:text-(--color-primary) cursor-pointer text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-white">
            <PlusIcon className="size-6" />
            Legg til CV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby={submitErrId}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Rediger kandidat" : "Legg til ny CV"}</DialogTitle>
        </DialogHeader>
        <p
          id={submitErrId}
          className="sr-only"
        >
          {isEditing
            ? "Skjema for å redigere eksisterende kandidat."
            : "Skjema for å legge til ny kandidat med CV. Alle felter er påkrevd."}
        </p>
        <form id="add-cv-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-cv-name">
                    Navn <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="add-cv-name"
                    placeholder="F.eks. Ola Nordmann"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`${nameDescId} ${fieldState.invalid ? nameErrId : ""}`.trim()}
                  />
                  <FieldDescription id={nameDescId}>
                    Skriv inn fullt navn.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <div id={nameErrId}>
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                </Field>
              )}
            />
            <Controller
              name="cv"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-cv-pdf">
                    CV (PDF)
                    {!isEditing && <span aria-hidden="true">*</span>}
                  </FieldLabel>
                  {isEditing && (
                    <p className="text-sm text-gray-500 mb-2">
                      Kandidaten har allerede en CV lagret. Velg en ny fil kun hvis du ønsker å ersatte den.
                    </p>
                  )}
                  <Input
                    id="add-cv-pdf"
                    type="file"
                    accept="application/pdf, .pdf"
                    required={!isEditing}
                    aria-required={!isEditing ? "true" : "false"}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`${cvDescId} ${fieldState.invalid ? cvErrId : ""}`.trim()}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      field.onChange(file)
                      if (file && (!isPdfFile(file) || file.size > MAX_PDF_BYTES)) {
                        e.target.value = ""
                      }
                      void form.trigger("cv")
                    }}
                  />
                  {!fieldState.invalid &&
                    <FieldDescription id={cvDescId}>
                      {isEditing ? "Valgfritt, maks 10MB." : "Påkrevd. PDF, maks 10MB."}
                    </FieldDescription>
                  }
                  {fieldState.invalid && (
                    <div id={cvErrId}>
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                </Field>
              )}
            />
            <Field>
              <FieldLabel id={amlGroupLabelId}>Arbeidsmiljøloven</FieldLabel>
              <div role="group" aria-labelledby={amlGroupLabelId} className="flex items-center gap-4">
                <Controller
                  name="aml46"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="add-cv-aml-46"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked)
                          if (e.target.checked) form.setValue("aml47", false)
                        }}
                      />
                      <FieldLabel htmlFor="add-cv-aml-46">§ 4.6</FieldLabel>
                    </div>
                  )}
                />
                <Controller
                  name="aml47"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="add-cv-aml-47"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked)
                          if (e.target.checked) form.setValue("aml46", false)
                        }}
                      />
                      <FieldLabel htmlFor="add-cv-aml-47">§ 4.7</FieldLabel>
                    </div>
                  )}
                />
              </div>
            </Field>
            <Controller 
              name="ansiennitet"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-cv-ansiennitet">
                    Ansiennitet
                  </FieldLabel>
                  <Input
                    type="number"
                    id="add-cv-ansiennitet"
                    step={1}
                    min={0}
                    max={100}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === "" ? null : Number(val))
                    }}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`${ansienitetDescId} ${fieldState.invalid ? ansienitetErrId : ""}`.trim()}
                  />
                  {!fieldState.invalid && (
                    <FieldDescription id={ansienitetDescId}>
                      Antall år, valgfritt (0–100).
                    </FieldDescription>
                  )}
                  {fieldState.invalid && (
                    <div id={ansienitetErrId}>
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                </Field>
              )}
            />
            {submitError && (
              <p className="text-sm text-red-600" role="alert" aria-live="polite">
                {submitError}
              </p>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="text-sm hover:bg-red-600 hover:text-white cursor-pointer"
            hidden={!isEditing}
            onClick={async () => {
              if (candidateToEdit?.id == null) return

              const deleted = await onDelete?.(
                candidateToEdit.id,
                candidateToEdit.name ?? `Kandidat ${candidateToEdit.id}`
              )
              if (deleted) {
                setOpen(false)
                form.reset()
              }
            }}
          >
            Slett
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="bg-(--color-primary) hover:bg-white text-white hover:text-(--color-primary) cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-white"
            onClick={() => {
              setOpen(false)
              form.reset()
              setSubmitError(null)
            }}
            disabled={form.formState.isSubmitting}
          >
            Avbryt
          </Button>
          <Button
            type="submit"
            form="add-cv-form"
            className="bg-(--color-primary) hover:bg-white text-white hover:text-(--color-primary) cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-white"
            disabled={form.formState.isSubmitting || !isCvSelectionValid}
          >
            {form.formState.isSubmitting ? "Lagrer..." : (isEditing ? "Oppdater" : "Legg til")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
export { AddNewCVModal }


