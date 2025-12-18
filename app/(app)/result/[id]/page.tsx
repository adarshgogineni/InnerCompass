import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { Button } from "@/components/ui/button";
import type { Reflection } from "@/lib/schemas";
import InteractiveReflection from "./InteractiveReflection";
import { ArrowLeft } from "lucide-react";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the reflection from the database
  const { data, error } = await supabase
    .from('journal_outputs')
    .select('output')
    .eq('entry_id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const reflection = data.output as Reflection;

  return (
    <div className="space-y-6">
      <InteractiveReflection entryId={id} initialReflection={reflection} />

      {/* Actions */}
      <div className="flex justify-center gap-4 pb-8">
        <Button asChild variant="outline" className="rounded-xl gap-2">
          <Link href="/history">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </Button>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/new">Write Another Entry</Link>
        </Button>
      </div>
    </div>
  );
}
