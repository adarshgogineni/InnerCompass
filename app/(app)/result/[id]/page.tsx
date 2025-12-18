import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { Button } from "@/components/ui/button";
import type { Reflection } from "@/lib/schemas";
import InteractiveReflection from "./InteractiveReflection";

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
      <div className="flex justify-center pb-8">
        <Button asChild variant="outline">
          <Link href="/new">Write Another Entry</Link>
        </Button>
      </div>
    </div>
  );
}
