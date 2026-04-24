import {
  AddNewCvSchema,
  MAX_PDF_BYTES,
  isPdfFile,
  type AddNewCvValues,
} from "@/validations/AddNewCvSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon, XIcon } from "lucide-react"
import { useId, useState, useEffect } from "react"
import { DeleteCandidateDialog } from "@/components/DeleteCandidateDialog"
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const isEditing = !!candidateToEdit
  const form = useForm<AddNewCvValues>({
    resolver: zodResolver(AddNewCvSchema),
    mode: "onSubmit",
    shouldFocusError: false,
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
        aml46: candidateToEdit.aml46 ?? false,
        aml47: candidateToEdit.aml47 ?? false,
        ansiennitet: candidateToEdit.ansiennitet ?? null,
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
          <Button variant="primary" className="p-2 cursor-pointer">
            <PlusIcon className="size-6" />
            <p className="text-regular p-2">
              Legg til kandidat
            </p>
            
          </Button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby={submitErrId} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Rediger kandidat" : "Legg til ny kandidat"}</DialogTitle>
        </DialogHeader>
        <button
          type="button"
          title="Lukk"
          aria-label="Lukk"
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 cursor-pointer [&_svg]:size-4"
          onMouseDown={(e) => {
            e.preventDefault()
            setOpen(false)
            setSubmitError(null)
            form.reset()
          }}
        >
          <XIcon />
        </button>
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
                    className="bg-white"
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
                      Kandidaten har allerede en CV lagret. Velg en ny fil kun hvis du ønsker å erstatte den.
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
                    className="bg-white file:text-blue-600 cursor-pointer"
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
                        type="radio"
                        id="add-cv-aml-46"
                        checked={field.value}
                        onClick={() => {
                          if (field.value) {
                            field.onChange(false)
                          } else {
                            field.onChange(true)
                            form.setValue("aml47", false)
                          }
                        }}
                        onChange={() => {}}
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
                        type="radio"
                        id="add-cv-aml-47"
                        checked={field.value}
                        onClick={() => {
                          if (field.value) {
                            field.onChange(false)
                          } else {
                            field.onChange(true)
                            form.setValue("aml46", false)
                          }
                        }}
                        onChange={() => {}}
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
                  <FieldLabel>Ansiennitet</FieldLabel>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Input
                      type="number"
                      id="add-cv-ansiennitet-years"
                      placeholder="År"
                      step={1}
                      min={0}
                      max={100}
                      value={field.value?.[0] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange([val === "" ? null : Number(val), field.value?.[1] ?? null, field.value?.[2] ?? null])
                      }}
                      aria-invalid={fieldState.invalid}
                      aria-label="Ansiennitet år"
                      className="bg-white"
                    />
                    <Input
                      type="number"
                      id="add-cv-ansiennitet-months"
                      placeholder="Måneder"
                      step={1}
                      min={0}
                      max={11}
                      value={field.value?.[1] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange([field.value?.[0] ?? null, val === "" ? null : Number(val), field.value?.[2] ?? null])
                      }}
                      aria-invalid={fieldState.invalid}
                      aria-label="Ansiennitet måneder"
                      className="bg-white"
                    />
                    <Input
                      type="number"
                      id="add-cv-ansiennitet-days"
                      placeholder="Dager"
                      step={1}
                      min={0}
                      max={30}
                      value={field.value?.[2] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange([field.value?.[0] ?? null, field.value?.[1] ?? null, val === "" ? null : Number(val)])
                      }}
                      aria-invalid={fieldState.invalid}
                      aria-label="Ansiennitet dager"
                      className="bg-white"
                    />
                  </div>
                  {!fieldState.invalid && (
                    <FieldDescription id={ansienitetDescId}>
                      Antall år, måneder og dager (valgfritt).
                    </FieldDescription>
                  )}
                  {fieldState.invalid && (
                    <div id={ansienitetErrId}>
                      <FieldError errors={[
                        fieldState.error?.message 
                          ? fieldState.error 
                          : (form.formState.errors.ansiennitet as any)?.[0] ??
                            (form.formState.errors.ansiennitet as any)?.[1] ??
                            (form.formState.errors.ansiennitet as any)?.[2] ??
                            { message: "Ugyldig verdi i ansiennitet" }
                      ]} />
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
            variant="destructive"
            className="cursor-pointer"
            hidden={!isEditing}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            Slett
          </Button>
          <DeleteCandidateDialog
            open={deleteConfirmOpen}
            onOpenChange={(open) => { if (!open) setDeleteConfirmOpen(false); }}
            candidateName={candidateToEdit?.name ?? `Kandidat ${candidateToEdit?.id}`}
            isDeleting={isDeleting}
            onConfirm={async () => {
              if (candidateToEdit?.id == null) return
              setIsDeleting(true)
              const deleted = await onDelete?.(
                candidateToEdit.id,
                candidateToEdit.name ?? `Kandidat ${candidateToEdit.id}`
              )
              setIsDeleting(false)
              setDeleteConfirmOpen(false)
              if (deleted) {
                setOpen(false)
                form.reset()
              }
            }}
          />
          <Button
            type="button"
            variant="cancel"
            className="cursor-pointer"
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
            variant="primary"
            className="cursor-pointer"
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


