import { z } from 'zod';

export const ReflectionSchema = z.object({
  mood_tags: z.array(z.string()).max(5),
  key_themes: z.array(z.string()).max(5),
  reflection_prompts: z.array(z.string()).min(2).max(5),
  micro_action: z.object({
    title: z.string(),
    duration_minutes: z.number().min(1).max(60),
    steps: z.array(z.string()).min(1).max(5),
  }),
  reframe: z.string().max(200),
  mantra: z.string().max(100).optional(),
  safety_note: z.string().optional(),
});

export type Reflection = z.infer<typeof ReflectionSchema>;

// Sample valid reflection for testing
export const sampleReflection: Reflection = {
  mood_tags: ['anxious', 'hopeful', 'determined'],
  key_themes: ['academic pressure', 'self-doubt', 'growth mindset'],
  reflection_prompts: [
    'What specific aspect of the exam are you most worried about?',
    'What strategies have helped you manage test anxiety in the past?',
    'How can you reframe this challenge as an opportunity to learn?',
  ],
  micro_action: {
    title: 'Quick Breathing Exercise',
    duration_minutes: 5,
    steps: [
      'Find a quiet space and sit comfortably',
      'Breathe in slowly for 4 counts',
      'Hold for 4 counts',
      'Exhale for 6 counts',
      'Repeat 5 times',
    ],
  },
  reframe: 'This exam is one step in your learning journey, not a measure of your worth. You\'ve prepared, and you\'re capable of doing your best.',
  mantra: 'I am prepared, I am capable, I trust myself.',
};
