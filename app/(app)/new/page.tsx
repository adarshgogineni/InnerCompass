"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function NewEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [entryText, setEntryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
          <CardDescription>
            Write about your thoughts, feelings, or experiences. Our AI will help you reflect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                placeholder="What's on your mind today?"
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={loading}
              />
              <div className={`text-sm text-right ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {charCount} / {maxLength}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || isEmpty || isOverLimit}
            >
              {loading ? "Generating reflection..." : "Generate Reflection"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
