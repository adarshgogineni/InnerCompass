import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Reflection } from "@/lib/schemas";

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Safety Note - Show prominently if present */}
      {reflection.safety_note && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{reflection.safety_note}</p>
          </CardContent>
        </Card>
      )}

      {/* Mood Tags */}
      {reflection.mood_tags && reflection.mood_tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How you're feeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reflection.mood_tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reframe */}
      <Card>
        <CardHeader>
          <CardTitle>A New Perspective</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{reflection.reframe}</p>
        </CardContent>
      </Card>

      {/* Micro-Action */}
      <Card>
        <CardHeader>
          <CardTitle>{reflection.micro_action.title}</CardTitle>
          <CardDescription>
            {reflection.micro_action.duration_minutes} minute{reflection.micro_action.duration_minutes !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {reflection.micro_action.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Reflection Prompts */}
      {reflection.reflection_prompts && reflection.reflection_prompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions to Explore</CardTitle>
            <CardDescription>Take your time with these prompts</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {reflection.reflection_prompts.map((prompt, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{prompt}</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-muted-foreground italic">
                      Take a moment to reflect on this question...
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Key Themes */}
      {reflection.key_themes && reflection.key_themes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reflection.key_themes.map((theme, index) => (
                <Badge key={index} variant="outline">{theme}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mantra */}
      {reflection.mantra && (
        <Card className="bg-accent">
          <CardContent className="pt-6">
            <p className="text-center text-xl italic font-light">"{reflection.mantra}"</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center">
        <Button asChild>
          <Link href="/new">Write Another Entry</Link>
        </Button>
      </div>
    </div>
  );
}
