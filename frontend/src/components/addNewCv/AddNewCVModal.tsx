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
  candidateToEdit?: Partial<Candidate>
  customTrigger?: React.ReactNode
}
function AddNewCVModal({ onCreated, candidateToEdit, customTrigger }: AddNewCVModalProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = !!candidateToEdit
  const form = useForm<AddNewCvValues>({
    resolver: zodResolver(AddNewCvSchema),
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: {
      name: candidateToEdit?.name ?? "",
      email: candidateToEdit?.email ?? "",
      cv: undefined as unknown as File,
    },
  })

  useEffect(() => {
    if (candidateToEdit) {
      form.reset({
        name: candidateToEdit.name ?? "",
        email: candidateToEdit.email ?? "",
        cv: undefined,
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
  const emailDescId = `add-cv-email-desc-${uid}`
  const emailErrId = `add-cv-email-err-${uid}`
  const cvDescId = `add-cv-pdf-desc-${uid}`
  const cvErrId = `add-cv-pdf-err-${uid}`
  const submitErrId = `add-cv-submit-err-${uid}`
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
            email: values.email,
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
            email: values.email,
            cv_pdf: null,
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
          <Button className="bg-(--color-primary) hover:bg-white text-white hover:text-(--color-primary) cursor-pointer px-4 py-2 rounded-md flex items-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 focus-visible:border-white">
            <PlusIcon className="size-6" />
            <p className="text-regular p-2">
              Legg til kandidat
            </p>
            
          </Button>
        )}
      </DialogTrigger>
      <DialogContent aria-describedby={submitErrId}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Rediger kandidat" : "Legg til ny kandidat"}</DialogTitle>
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
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-cv-email">
                    E-post <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="add-cv-email"
                    type="email"
                    placeholder="ola@example.com"
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`${emailDescId} ${fieldState.invalid ? emailErrId : ""}`.trim()}
                  />
                  <FieldDescription id={emailDescId}>
                    Må være en gyldig e-postadresse.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <div id={emailErrId}>
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


