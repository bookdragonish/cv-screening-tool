import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

type ErrorProps = {
  title: string;
  message: string;
};

function ErrorBox({ title, message }: ErrorProps) {
  return (
    <Alert className="max-w-md border-amber-900 bg-red-100 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <AlertTriangleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
export default ErrorBox;
