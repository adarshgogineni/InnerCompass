import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <Link href="/new">InnerCompass Mini</Link>
          </h1>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/new">New Entry</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/history">History</Link>
            </Button>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
