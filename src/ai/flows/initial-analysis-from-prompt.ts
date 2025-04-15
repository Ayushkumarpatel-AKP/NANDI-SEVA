'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing cow images based on a user-provided prompt.
 *
 * It includes:
 * - InitialAnalysisInput: The input type for the initial analysis, including a user prompt and image URL.
 * - InitialAnalysisOutput: The output type, providing details about the cow's breed, color, and health.
 * - initialAnalysis: The main function to trigger the analysis flow.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {suggestTreatment, SuggestTreatmentOutput} from "@/ai/flows/suggest-treatment-flow";
import {generateConditionsAndTreatments, GenerateConditionsAndTreatmentsOutput} from "@/ai/flows/generate-conditions-and-treatments";

const InitialAnalysisInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the cow image.'),
  prompt: z.string().describe('A prompt describing the cow image and desired analysis.'),
});
export type InitialAnalysisInput = z.infer<typeof InitialAnalysisInputSchema>;

const InitialAnalysisOutputSchema = z.object({
  cowPresent: z.boolean().describe('Whether a cow is present in the image.'),
  breed: z.string().describe('The breed of the cow.'),
  color: z.string().describe('The color and markings of the cow.'),
  health: z.string().describe('Visible signs of illness or abnormalities in the cow.'),
  treatmentSuggestions: z.string().optional().describe('AI suggested treatments for detected diseases, including emojis.'),
  diseaseDetails: z.array(z.object({
    diseaseName: z.string(),
    medicineName: z.string(),
    medicineLink: z.string()
  })).optional().describe('List of suspected conditions and treatments for detected diseases, including emojis.')
});
export type InitialAnalysisOutput = z.infer<typeof InitialAnalysisOutputSchema>;

export async function initialAnalysis(input: InitialAnalysisInput): Promise<InitialAnalysisOutput> {
  return initialAnalysisFlow(input);
}

const initialAnalysisPrompt = ai.definePrompt({
  name: 'initialAnalysisPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the cow image.'),
      prompt: z.string().describe('A prompt describing the cow image and desired analysis.'),
    }),
  },
  output: {
    schema: z.object({
      cowPresent: z.boolean().describe('Whether a cow is present in the image.'),
      breed: z.string().describe('The breed of the cow.'),
      color: z.string().describe('The color and markings of the cow.'),
      health: z.string().describe('Visible signs of illness or abnormalities in the cow.'),
    }),
  },
  prompt: `Based on the image at {{media url=imageUrl}} and the following prompt: {{{prompt}}}, provide an analysis of the cow in terms of breed, color, and health.
If no cow is present, set cowPresent to false and leave the other fields blank. If a cow is present, set cowPresent to true and analyze the other fields. Use emojis in the output to make it more engaging.
`,
});

const initialAnalysisFlow = ai.defineFlow<
  typeof InitialAnalysisInputSchema,
  typeof InitialAnalysisOutputSchema
>({
  name: 'initialAnalysisFlow',
  inputSchema: InitialAnalysisInputSchema,
  outputSchema: InitialAnalysisOutputSchema,
},
async input => {
  const {output} = await initialAnalysisPrompt(input);
  if (output && output.cowPresent && output.health !== "No visible disease signs") {
    try {
      const treatmentResult: SuggestTreatmentOutput = await suggestTreatment({ disease: output.health });
      output.treatmentSuggestions = treatmentResult.treatmentSuggestions;

      // Generate conditions and treatments using the new flow
      const conditionsAndTreatments: GenerateConditionsAndTreatmentsOutput = await generateConditionsAndTreatments({ disease: output.health });
      output.diseaseDetails = conditionsAndTreatments;

    } catch (error) {
      console.error("Error suggesting treatment:", error);
      output.treatmentSuggestions = "Failed to retrieve treatment suggestions.";
      output.diseaseDetails = [];
    }
  } else {
    output!.diseaseDetails = [];
  }
  return output!;
});
