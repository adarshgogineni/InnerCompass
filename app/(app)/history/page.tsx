import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Reflection } from "@/lib/schemas";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all journal entries with their reflections
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select(`
      id,
      entry_text,
      created_at,
      journal_outputs (
        output
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching history:', error);
    return <div>Error loading history</div>;
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No Entries Yet</CardTitle>
            <CardDescription>
              You haven't written any journal entries yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/new">Write Your First Entry</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Journal History</h1>
          <p className="text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Button asChild>
          <Link href="/new">New Entry</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {entries.map((entry: any) => {
          const reflection = entry.journal_outputs?.[0]?.output as Reflection | undefined;
          const date = new Date(entry.created_at);
          const preview = entry.entry_text.slice(0, 150) + (entry.entry_text.length > 150 ? '...' : '');

          return (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base">
                      {date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/result/${entry.id}`}>View Reflection</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  "{preview}"
                </p>

                {reflection && reflection.mood_tags && reflection.mood_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reflection.mood_tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {reflection.mood_tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{reflection.mood_tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
