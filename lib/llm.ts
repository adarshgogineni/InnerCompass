import OpenAI from 'openai';
import { getOpenAIKey } from './env';
import { ReflectionSchema, type Reflection } from './schemas';

const openai = new OpenAI({
  apiKey: getOpenAIKey(),
});

const SYSTEM_PROMPT = `You are a compassionate journaling assistant that helps users reflect on their thoughts and emotions.

Your task is to analyze a journal entry and return a structured JSON reflection that follows this EXACT schema:

{
  "mood_tags": ["string"] // 1-5 short mood descriptors (e.g., "anxious", "hopeful", "frustrated")
  "key_themes": ["string"] // 1-5 main themes or topics in the entry
  "reflection_prompts": ["string"] // 2-5 thoughtful questions to help the user reflect deeper
  "micro_action": {
    "title": "string" // A short, actionable title
    "duration_minutes": number // 1-60 minutes
    "steps": ["string"] // 1-5 simple, concrete steps
  }
  "reframe": "string" // A compassionate reframing (max 200 chars)
  "mantra": "string" // Optional short affirmation (max 100 chars)
  "safety_note": "string" // REQUIRED if entry mentions self-harm, crisis, or severe distress. Include crisis resources.
}

Guidelines:
- Be empathetic and non-judgmental
- Reflection prompts should be open-ended and thought-provoking
- Micro-actions should be simple, specific, and achievable
- Reframes should validate feelings while offering perspective
- If the entry mentions self-harm, suicidal thoughts, or severe crisis, ALWAYS include a safety_note with crisis helpline information
- Return ONLY valid JSON, no other text`;

export async function generateReflection(entryText: string): Promise<Reflection> {
  let lastError: Error | null = null;
  let lastInvalidResponse: string | null = null;

  // Try up to 2 times (initial attempt + 1 retry)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];

      // If this is a retry, include the previous invalid response and ask for a fix
      if (attempt === 2 && lastInvalidResponse) {
        messages.push(
          { role: 'user', content: entryText },
          { role: 'assistant', content: lastInvalidResponse },
          {
            role: 'system',
            content: `Your previous response did not match the required schema. Error: ${lastError?.message}\n\nPlease fix the JSON to match the exact schema provided. Ensure all required fields are present and have the correct types.`
          }
        );
      } else {
        messages.push({ role: 'user', content: entryText });
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      const rawJson = JSON.parse(content);
      const reflection = ReflectionSchema.parse(rawJson);

      // Success! Return the validated reflection
      if (attempt === 2) {
        console.log('✓ Reflection validated successfully on retry');
      }
      return reflection;

    } catch (error) {
      lastError = error as Error;

      if (attempt === 1) {
        // Store the invalid response for the retry
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: entryText },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          });
          lastInvalidResponse = completion.choices[0].message.content || '';
        } catch {
          lastInvalidResponse = null;
        }

        console.warn(`Attempt ${attempt} failed, retrying...`, error);
        continue; // Try again
      } else {
        // Second attempt also failed
        console.error('Failed to generate valid reflection after 2 attempts:', error);
        throw new Error('Unable to generate a valid reflection. Please try again.');
      }
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('Unexpected error in generateReflection');
}
