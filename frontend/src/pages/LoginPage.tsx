import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AUTH_KEY = "jobb_skanner_logged_in";

export default function LoginPage() {
  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(AUTH_KEY, "true");
    navigate("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-16 w-auto" aria-hidden="true" />
          <h1 className="page-title text-(--color-dark)">Jobb-skanner</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-smaller font-medium text-(--color-dark)">
              Brukernavn
            </label>
            <Input id="username" type="text" autoComplete="username" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-smaller font-medium text-(--color-dark)">
              Passord
            </label>
            <Input id="password" type="password" autoComplete="current-password" />
          </div>

          <Button type="submit" className="hover-dark-button mt-2 w-full">
            Logg inn
          </Button>
        </form>
      </div>
    </main>
  );
}
