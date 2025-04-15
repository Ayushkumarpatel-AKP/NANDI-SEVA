'use server';

/**
 * @fileOverview Summarizes the analysis history of CowHealth AI.
 *
 * - summarizeAnalysisHistory - A function that summarizes the analysis history.
 * - SummarizeAnalysisHistoryInput - The input type for the summarizeAnalysisHistory function.
 * - SummarizeAnalysisHistoryOutput - The return type for the summarizeAnalysisHistory function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeAnalysisHistoryInputSchema = z.object({
  analysisHistory: z
    .string()
    .describe('The history of all CowHealth AI analyses performed by the user.'),
});
export type SummarizeAnalysisHistoryInput = z.infer<
  typeof SummarizeAnalysisHistoryInputSchema
>;

const SummarizeAnalysisHistoryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the CowHealth AI analysis history.'),
});
export type SummarizeAnalysisHistoryOutput = z.infer<
  typeof SummarizeAnalysisHistoryOutputSchema
>;

export async function summarizeAnalysisHistory(
  input: SummarizeAnalysisHistoryInput
): Promise<SummarizeAnalysisHistoryOutput> {
  return summarizeAnalysisHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnalysisHistoryPrompt',
  input: {
    schema: z.object({
      analysisHistory: z
        .string()
        .describe('The history of all CowHealth AI analyses performed by the user.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z
        .string()
        .describe('A concise summary of the CowHealth AI analysis history.'),
    }),
  },
  prompt: `You are an AI assistant that summarizes analysis histories of CowHealth AI.

  Summarize the following analysis history:

  {{analysisHistory}}`,
});

const summarizeAnalysisHistoryFlow = ai.defineFlow<
  typeof SummarizeAnalysisHistoryInputSchema,
  typeof SummarizeAnalysisHistoryOutputSchema
>({
  name: 'summarizeAnalysisHistoryFlow',
  inputSchema: SummarizeAnalysisHistoryInputSchema,
  outputSchema: SummarizeAnalysisHistoryOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
