import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";

type DeleteCandidateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
};

export function DeleteCandidateDialog({
  open,
  onOpenChange,
  candidateName,
  onConfirm,
  isDeleting = false,
}: DeleteCandidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Slett kandidat</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil slette{" "}
            <span className="font-medium text-foreground">{candidateName}</span>
            ? Denne handlingen kan ikke angres.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting} className="cursor-pointer bg-white hover:bg-white">
              Avbryt
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            {isDeleting ? "Sletter..." : "Slett"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
