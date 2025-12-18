"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Reflection } from "@/lib/schemas";
import { Search, ArrowRight, BookOpen } from "lucide-react";

interface JournalEntry {
  id: string;
  entry_text: string;
  created_at: string;
  journal_outputs?: Array<{ output: Reflection }>;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEntries() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
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
        .limit(50);

      if (fetchError) {
        console.error('Error fetching history:', fetchError);
        setError("Error loading history");
      } else {
        setEntries(data || []);
        setFilteredEntries(data || []);
      }
      setLoading(false);
    }

    fetchEntries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntries(entries);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = entries.filter((entry) => {
        const textMatch = entry.entry_text.toLowerCase().includes(query);
        const reflection = entry.journal_outputs?.[0]?.output as Reflection | undefined;
        const moodMatch = reflection?.mood_tags?.some(tag => tag.toLowerCase().includes(query));
        const reframeMatch = reflection?.reframe?.toLowerCase().includes(query);
        return textMatch || moodMatch || reframeMatch;
      });
      setFilteredEntries(filtered);
    }
  }, [searchQuery, entries]);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-3">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h1 className="text-3xl font-display font-semibold">Your journal awaits</h1>
          <p className="text-lg text-muted-foreground">
            Start your mindfulness journey by writing your first entry.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-xl gap-2">
          <Link href="/new">
            Write Your First Entry
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-semibold tracking-tight">
            Your Reflections
          </h1>
          <p className="text-lg text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in your journey
          </p>
        </div>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/new">
            <span>New Entry</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search your entries, moods, or reflections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl"
        />
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
        </p>
      )}

      {/* Entries Grid */}
      <div className="grid gap-4">
        {filteredEntries.map((entry) => {
          const reflection = entry.journal_outputs?.[0]?.output as Reflection | undefined;
          const date = new Date(entry.created_at);
          const preview = entry.entry_text.slice(0, 180) + (entry.entry_text.length > 180 ? '...' : '');
          const reframePreview = reflection?.reframe ? reflection.reframe.slice(0, 120) + (reflection.reframe.length > 120 ? '...' : '') : null;

          return (
            <Card key={entry.id} className="zen-card hover-lift cursor-pointer group">
              <Link href={`/result/${entry.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg font-display group-hover:text-primary transition-colors">
                        {date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
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
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Entry Preview */}
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{preview}"
                  </p>

                  {/* Reframe Preview */}
                  {reframePreview && (
                    <div className="bg-accent/30 border-l-2 border-primary/50 pl-4 py-2 rounded-r-lg">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {reframePreview}
                      </p>
                    </div>
                  )}

                  {/* Mood Tags */}
                  {reflection && reflection.mood_tags && reflection.mood_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {reflection.mood_tags.slice(0, 4).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="pill-badge text-xs bg-secondary/70 hover:bg-secondary"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {reflection.mood_tags.length > 4 && (
                        <Badge variant="outline" className="pill-badge text-xs">
                          +{reflection.mood_tags.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {filteredEntries.length === 0 && searchQuery && (
        <div className="text-center py-12 space-y-3">
          <p className="text-lg text-muted-foreground">No entries found matching "{searchQuery}"</p>
          <Button
            variant="ghost"
            onClick={() => setSearchQuery("")}
            className="rounded-xl"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
