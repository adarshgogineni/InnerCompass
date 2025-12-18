"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STARTER_PROMPTS = [
  "What's weighing on my mind right now?",
  "What am I grateful for today?",
  "What challenge am I facing and how might I grow from it?",
  "What would bring me more peace today?",
  "What did I learn about myself this week?",
];

export default function NewEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [entryText, setEntryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatingStep, setGeneratingStep] = useState("");

  const maxLength = 5000;
  const charCount = entryText.length;
  const isOverLimit = charCount > maxLength;
  const isEmpty = entryText.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEmpty) {
      setError("Please write something in your journal entry");
      return;
    }

    if (isOverLimit) {
      setError(`Entry is too long. Maximum ${maxLength} characters allowed.`);
      return;
    }

    setError("");
    setLoading(true);

    // Show generating steps
    setGeneratingStep("Reading your entry...");
    setTimeout(() => setGeneratingStep("Extracting themes..."), 1000);
    setTimeout(() => setGeneratingStep("Crafting micro-action..."), 2000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_text: entryText }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error); // Rate limit message already user-friendly
          setLoading(false);
          setGeneratingStep("");
          return;
        }
        throw new Error(data.error || "Failed to generate reflection");
      }

      console.log("Reflection generated and saved:", data);

      // Navigate to the result page
      router.push(`/result/${data.entry_id}`);

    } catch (err) {
      console.error("Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate reflection";
      setError(errorMessage);
      setGeneratingStep("");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const insertPrompt = (prompt: string) => {
    setEntryText(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-display font-semibold tracking-tight">
          What's on your mind?
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          Take a moment to reflect. Share your thoughts, and let's find clarity together.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Left Column - Main Entry Form */}
        <div>
          <Card className="zen-card">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <Textarea
                    placeholder="What's on your mind today?"
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    className="min-h-[320px] journal-textarea rounded-2xl px-5 py-4 text-base"
                    disabled={loading}
                  />
                  <div className={`text-sm text-right ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                    {charCount} / {maxLength}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-medium hover:scale-[1.02] transition-all shadow-md gap-2"
                  disabled={loading || isEmpty || isOverLimit}
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      {generatingStep || "Generating reflection..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Reflection
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* What You'll Get Card */}
          <Card className="zen-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                What you'll get
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Mood insights from your words</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>A fresh perspective to reframe your thoughts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>A simple 5-minute micro-action to take</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>Thoughtful prompts for deeper reflection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>A personal mantra to carry forward</span>
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Starter Prompts Card */}
          <Card className="zen-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Starter prompts</CardTitle>
              <CardDescription className="text-sm">
                Not sure where to begin? Try one of these
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {STARTER_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => insertPrompt(prompt)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm bg-secondary/50 hover:bg-secondary hover:scale-[1.02] transition-all border border-border/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
