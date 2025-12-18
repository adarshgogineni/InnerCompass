"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Pencil, X, Plus, Loader2, Play, Pause, RotateCcw } from "lucide-react";
import type { Reflection, InteractiveReflection } from "@/lib/schemas";
import { toInteractiveReflection } from "@/lib/schemas";

interface InteractiveReflectionProps {
  entryId: string;
  initialReflection: Reflection | InteractiveReflection;
}

// Type guard to check if reflection is already interactive
function isInteractiveReflection(reflection: Reflection | InteractiveReflection): reflection is InteractiveReflection {
  return 'prompt_responses' in reflection &&
    typeof reflection.micro_action.steps[0] === 'object' &&
    'text' in reflection.micro_action.steps[0];
}

export default function InteractiveReflection({ entryId, initialReflection }: InteractiveReflectionProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Convert to interactive format if needed
  const [reflection, setReflection] = useState<InteractiveReflection>(() => {
    if (isInteractiveReflection(initialReflection)) {
      return initialReflection;
    }
    return toInteractiveReflection(initialReflection);
  });

  // Edit modes
  const [editingMoodTags, setEditingMoodTags] = useState(false);
  const [editingThemes, setEditingThemes] = useState(false);
  const [newMoodTag, setNewMoodTag] = useState("");
  const [newTheme, setNewTheme] = useState("");

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer with duration from micro_action
  useEffect(() => {
    if (reflection.micro_action.duration_minutes) {
      const seconds = reflection.micro_action.duration_minutes * 60;
      setTotalTime(seconds);
      setTimeRemaining(seconds);
    }
  }, [reflection.micro_action.duration_minutes]);

  // Timer countdown effect
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerInterval.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            toast({
              title: "Time's up!",
              description: "Great job completing the micro-action!",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerRunning, timeRemaining, toast]);

  const startTimer = () => {
    if (timeRemaining > 0) {
      setTimerRunning(true);
    }
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeRemaining(totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentRemaining = (timeRemaining / totalTime) * 100;
    if (percentRemaining > 50) return "text-green-600";
    if (percentRemaining > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/reflections/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save changes");
      }

      setHasChanges(false);
      toast({
        title: "Changes saved",
        description: "Your reflection has been updated successfully.",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addMoodTag = () => {
    if (newMoodTag.trim() && reflection.mood_tags.length < 10) {
      setReflection({
        ...reflection,
        mood_tags: [...reflection.mood_tags, newMoodTag.trim()],
      });
      setNewMoodTag("");
      setHasChanges(true);
    }
  };

  const removeMoodTag = (index: number) => {
    setReflection({
      ...reflection,
      mood_tags: reflection.mood_tags.filter((_, i) => i !== index),
    });
    setHasChanges(true);
  };

  const addTheme = () => {
    if (newTheme.trim() && reflection.key_themes.length < 10) {
      setReflection({
        ...reflection,
        key_themes: [...reflection.key_themes, newTheme.trim()],
      });
      setNewTheme("");
      setHasChanges(true);
    }
  };

  const removeTheme = (index: number) => {
    setReflection({
      ...reflection,
      key_themes: reflection.key_themes.filter((_, i) => i !== index),
    });
    setHasChanges(true);
  };

  const toggleStepCompletion = (stepIndex: number) => {
    const newSteps = [...reflection.micro_action.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      completed: !newSteps[stepIndex].completed,
    };
    setReflection({
      ...reflection,
      micro_action: {
        ...reflection.micro_action,
        steps: newSteps,
      },
    });
    setHasChanges(true);
  };

  const updateStepNotes = (stepIndex: number, notes: string) => {
    const newSteps = [...reflection.micro_action.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      notes,
    };
    setReflection({
      ...reflection,
      micro_action: {
        ...reflection.micro_action,
        steps: newSteps,
      },
    });
    setHasChanges(true);
  };

  const updatePromptResponse = (promptIndex: number, response: string) => {
    setReflection({
      ...reflection,
      prompt_responses: {
        ...reflection.prompt_responses,
        [promptIndex]: response,
      },
    });
    setHasChanges(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Safety Note */}
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
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">How you're feeling</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingMoodTags(!editingMoodTags)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {reflection.mood_tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  {editingMoodTags && (
                    <button
                      onClick={() => removeMoodTag(index)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {editingMoodTags && reflection.mood_tags.length < 10 && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a mood tag..."
                  value={newMoodTag}
                  onChange={(e) => setNewMoodTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMoodTag();
                    }
                  }}
                />
                <Button onClick={addMoodTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
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
      <Card className="relative">
        {/* Timer Display - Top Right Corner */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg z-10">
          <div className={`text-lg font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          <div className="flex gap-1">
            {!timerRunning ? (
              <Button onClick={startTimer} size="sm" disabled={timeRemaining === 0} className="h-7 px-2">
                <Play className="h-3 w-3" />
              </Button>
            ) : (
              <Button onClick={pauseTimer} size="sm" variant="outline" className="h-7 px-2">
                <Pause className="h-3 w-3" />
              </Button>
            )}
            <Button onClick={resetTimer} size="sm" variant="ghost" className="h-7 px-2">
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <CardHeader>
          <CardTitle>{reflection.micro_action.title}</CardTitle>
          <CardDescription>
            {reflection.micro_action.duration_minutes} minute{reflection.micro_action.duration_minutes !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Steps */}
          <div className="space-y-3">
          {reflection.micro_action.steps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div
                className="flex gap-3 items-start cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                onClick={() => toggleStepCompletion(index)}
              >
                <Checkbox
                  checked={step.completed}
                  onCheckedChange={() => toggleStepCompletion(index)}
                  className="mt-1"
                />
                <span className={step.completed ? "text-green-600 font-medium" : ""}>
                  {step.text}
                </span>
              </div>
              {step.completed && (
                <Textarea
                  placeholder="Add your reflection notes here..."
                  value={step.notes}
                  onChange={(e) => updateStepNotes(index, e.target.value)}
                  className="ml-8 min-h-[80px]"
                />
              )}
            </div>
          ))}
          </div>
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
                  <AccordionContent className="space-y-3">
                    <div className="text-sm text-muted-foreground italic">
                      Take a moment to reflect on this question...
                    </div>
                    <Textarea
                      placeholder="Write your thoughts here..."
                      value={reflection.prompt_responses[index] || ""}
                      onChange={(e) => updatePromptResponse(index, e.target.value)}
                      className="min-h-[120px]"
                    />
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
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Key Themes</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingThemes(!editingThemes)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {reflection.key_themes.map((theme, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {theme}
                  {editingThemes && (
                    <button
                      onClick={() => removeTheme(index)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {editingThemes && reflection.key_themes.length < 10 && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a theme..."
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTheme();
                    }
                  }}
                />
                <Button onClick={addTheme} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
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

      {/* Save Button */}
      <div className="flex justify-center gap-4 sticky bottom-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          size="lg"
          className="min-w-[200px]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
