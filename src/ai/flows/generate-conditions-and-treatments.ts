'use server';

/**
 * @fileOverview Generates suspected conditions and treatments for cow diseases using Gemini AI.
 *
 * - generateConditionsAndTreatments - A function that generates the conditions and treatments.
 * - GenerateConditionsAndTreatmentsInput - The input type for the generateConditionsAndTreatments function.
 * - GenerateConditionsAndTreatmentsOutput - The return type for the generateConditionsAndTreatments function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateConditionsAndTreatmentsInputSchema = z.object({
  disease: z.string().describe('The detected disease of the cow.'),
});
export type GenerateConditionsAndTreatmentsInput = z.infer<typeof GenerateConditionsAndTreatmentsInputSchema>;

const TreatmentItemSchema = z.object({
  diseaseName: z.string().describe('The name of the disease.'),
  medicineName: z.string().describe('The recommended medicine for the disease.'),
  medicineLink: z.string().describe('A link to more information about the medicine.'),
});

const GenerateConditionsAndTreatmentsOutputSchema = z.array(TreatmentItemSchema);
export type GenerateConditionsAndTreatmentsOutput = z.infer<typeof GenerateConditionsAndTreatmentsOutputSchema>;

export async function generateConditionsAndTreatments(input: GenerateConditionsAndTreatmentsInput): Promise<GenerateConditionsAndTreatmentsOutput> {
  return generateConditionsAndTreatmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConditionsAndTreatmentsPrompt',
  input: {
    schema: z.object({
      disease: z.string().describe('The detected disease of the cow.'),
    }),
  },
  output: {
    schema: z.array(TreatmentItemSchema).describe('Array of treatment items with disease name, medicine name, and medicine link.'),
  },
  prompt: `You are an expert veterinarian AI assistant. Based on the detected disease of a cow, suggest a list of medicines and a link to find out more about the medicine.
  Disease: {{{disease}}}

  Respond with a JSON array of objects like this:
  \`\`\`json
  [
    {
      "diseaseName": "Disease name",
      "medicineName": "Medicine name",
      "medicineLink": "Link to medicine information"
    }
  ]
  \`\`\`
  Ensure that the medicine links are legitimate and point to a valid resource.
  `,
});

const generateConditionsAndTreatmentsFlow = ai.defineFlow<
  typeof GenerateConditionsAndTreatmentsInputSchema,
  typeof GenerateConditionsAndTreatmentsOutputSchema
>({
  name: 'generateConditionsAndTreatmentsFlow',
  inputSchema: GenerateConditionsAndTreatmentsInputSchema,
  outputSchema: GenerateConditionsAndTreatmentsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
