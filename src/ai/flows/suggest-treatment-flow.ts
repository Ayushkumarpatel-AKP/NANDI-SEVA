'use server';

/**
 * @fileOverview A treatment suggestion AI agent.
 *
 * - suggestTreatment - A function that handles the treatment suggestion process.
 * - SuggestTreatmentInput - The input type for the suggestTreatment function.
 * - SuggestTreatmentOutput - The return type for the suggestTreatment function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestTreatmentInputSchema = z.object({
  disease: z.string().describe('The detected disease of the cow.'),
});
export type SuggestTreatmentInput = z.infer<typeof SuggestTreatmentInputSchema>;

const SuggestTreatmentOutputSchema = z.object({
  treatmentSuggestions: z.string().describe('Suggested treatments for the detected disease.'),
});
export type SuggestTreatmentOutput = z.infer<typeof SuggestTreatmentOutputSchema>;

export async function suggestTreatment(input: SuggestTreatmentInput): Promise<SuggestTreatmentOutput> {
  return suggestTreatmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentPrompt',
  input: {
    schema: z.object({
      disease: z.string().describe('The detected disease of the cow.'),
    }),
  },
  output: {
    schema: z.object({
      treatmentSuggestions: z.string().describe('Suggested treatments for the detected disease.'),
    }),
  },
  prompt: `You are an expert veterinarian specializing in suggesting concise treatments for cow diseases.

Based on the detected disease, provide brief treatment suggestions. Use emojis to make it more engaging.

Disease: {{{disease}}}`,
});

const suggestTreatmentFlow = ai.defineFlow<
  typeof SuggestTreatmentInputSchema,
  typeof SuggestTreatmentOutputSchema
>({
  name: 'suggestTreatmentFlow',
  inputSchema: SuggestTreatmentInputSchema,
  outputSchema: SuggestTreatmentOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
