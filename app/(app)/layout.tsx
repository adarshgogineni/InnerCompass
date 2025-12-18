import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

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
    <div className="zen-background">
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 max-w-5xl">
          <div className="flex justify-between items-center">
            {/* Brand */}
            <Link
              href="/new"
              className="flex items-center gap-2 group transition-all hover:scale-[1.02]"
            >
              <Compass className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
              <h1 className="text-xl font-display font-semibold tracking-tight text-foreground">
                InnerCompass
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full font-medium">
                <Link href="/new">New Entry</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full font-medium">
                <Link href="/history">History</Link>
              </Button>
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
