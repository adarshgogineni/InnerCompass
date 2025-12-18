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
import { Pencil, X, Plus, Loader2, Play, Pause, RotateCcw, Quote, AlertCircle } from "lucide-react";
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
    if (percentRemaining > 50) return "text-success";
    if (percentRemaining > 20) return "text-warning";
    return "text-destructive";
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

  const completedSteps = reflection.micro_action.steps.filter(s => s.completed).length;
  const totalSteps = reflection.micro_action.steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Safety Note - Compact Alert */}
      {reflection.safety_note && (
        <div className="zen-card bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Important Note</p>
                <p className="text-sm text-destructive/90 mt-1">{reflection.safety_note}</p>
              </div>
            </div>
          </CardContent>
        </div>
      )}

      {/* 2-Column Layout on Desktop */}
      <div className="grid lg:grid-cols-[1fr,420px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Mood Tags */}
          {reflection.mood_tags && reflection.mood_tags.length > 0 && (
            <Card className="zen-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-display">How you're feeling</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingMoodTags(!editingMoodTags)}
                    className="rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {reflection.mood_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="pill-badge gap-1">
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
                      className="rounded-xl"
                    />
                    <Button onClick={addMoodTag} size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reframe - Quote Style */}
          <Card className="zen-card bg-accent/20 border-accent/30">
            <CardHeader>
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                A New Perspective
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed italic text-foreground/90">
                "{reflection.reframe}"
              </p>
            </CardContent>
          </Card>

          {/* Reflection Prompts */}
          {reflection.reflection_prompts && reflection.reflection_prompts.length > 0 && (
            <Card className="zen-card">
              <CardHeader>
                <CardTitle className="text-xl font-display">Questions to Explore</CardTitle>
                <CardDescription className="text-base">Take your time with these prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {reflection.reflection_prompts.map((prompt, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                      <AccordionTrigger className="text-left hover:no-underline hover:text-primary text-base">
                        {prompt}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <div className="text-sm text-muted-foreground italic">
                          Take a moment to reflect on this question...
                        </div>
                        <Textarea
                          placeholder="Write your thoughts here..."
                          value={(reflection.prompt_responses?.[index] as string | undefined) || ""}
                          onChange={(e) => updatePromptResponse(index, e.target.value)}
                          className="min-h-[120px] rounded-xl journal-textarea"
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
            <Card className="zen-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-display">Key Themes</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingThemes(!editingThemes)}
                    className="rounded-full"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {reflection.key_themes.map((theme, index) => (
                    <Badge key={index} variant="outline" className="pill-badge gap-1">
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
                      className="rounded-xl"
                    />
                    <Button onClick={addTheme} size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mantra */}
          {reflection.mantra && (
            <Card className="zen-card bg-accent/30 border-accent/40">
              <CardContent className="py-8">
                <p className="text-center text-2xl italic font-light font-display tracking-tight text-foreground/90">
                  "{reflection.mantra}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sticky Micro-Action */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="zen-card relative">
            {/* Timer Display - Top Right Corner */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-xl px-3 py-2 shadow-sm z-10">
              <div className={`text-lg font-mono font-bold ${getTimerColor()}`}>
                {formatTime(timeRemaining)}
              </div>
              <div className="flex gap-1">
                {!timerRunning ? (
                  <Button onClick={startTimer} size="sm" disabled={timeRemaining === 0} className="h-7 px-2 rounded-lg">
                    <Play className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="sm" variant="outline" className="h-7 px-2 rounded-lg">
                    <Pause className="h-3 w-3" />
                  </Button>
                )}
                <Button onClick={resetTimer} size="sm" variant="ghost" className="h-7 px-2 rounded-lg">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-xl font-display pr-32">{reflection.micro_action.title}</CardTitle>
              <CardDescription className="text-base">
                {reflection.micro_action.duration_minutes} minute{reflection.micro_action.duration_minutes !== 1 ? 's' : ''} • {completedSteps} of {totalSteps} completed
              </CardDescription>
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Steps */}
              <div className="space-y-3">
                {reflection.micro_action.steps.map((step, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="flex gap-3 items-start cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors"
                      onClick={() => toggleStepCompletion(index)}
                    >
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleStepCompletion(index)}
                        className="mt-1"
                      />
                      <span className={step.completed ? "text-success font-medium" : ""}>
                        {step.text}
                      </span>
                    </div>
                    {step.completed && (
                      <Textarea
                        placeholder="Add your reflection notes here..."
                        value={step.notes}
                        onChange={(e) => updateStepNotes(index, e.target.value)}
                        className="ml-8 min-h-[80px] rounded-xl journal-textarea"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center gap-4 sticky bottom-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          size="lg"
          className="min-w-[200px] h-12 rounded-xl shadow-lg"
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
