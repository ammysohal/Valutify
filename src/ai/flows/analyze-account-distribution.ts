'use server';

/**
 * @fileOverview AI tool to analyze account distribution and identify invalid or unusable credentials.
 *
 * - analyzeAccountDistribution - Analyzes account distribution.
 * - AnalyzeAccountDistributionInput - The input type for the analyzeAccountDistribution function.
 * - AnalyzeAccountDistributionOutput - The return type for the analyzeAccountDistribution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAccountDistributionInputSchema = z.object({
  accountData: z.array(
    z.object({
      email: z.string().describe('The email address of the Minecraft account.'),
      password: z.string().describe('The password of the Minecraft account.'),
      status: z
        .string()
        .describe(
          'The status of the Minecraft account (e.g., unclaimed, claimed).' ),
    })
  ).describe('Array of Minecraft account data.'),
});
export type AnalyzeAccountDistributionInput = z.infer<
  typeof AnalyzeAccountDistributionInputSchema
>;

const AnalyzeAccountDistributionOutputSchema = z.object({
  analysisResults: z
    .string()
    .describe(
      'The analysis results, including identified invalid or unusable credentials and trends/correlations.'
    ),
});
export type AnalyzeAccountDistributionOutput = z.infer<
  typeof AnalyzeAccountDistributionOutputSchema
>;

export async function analyzeAccountDistribution(
  input: AnalyzeAccountDistributionInput
): Promise<AnalyzeAccountDistributionOutput> {
  return analyzeAccountDistributionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAccountDistributionPrompt',
  input: {schema: AnalyzeAccountDistributionInputSchema},
  output: {schema: AnalyzeAccountDistributionOutputSchema},
  prompt: `You are an AI assistant tasked with analyzing Minecraft account distribution to identify invalid or unusable credentials.

  Analyze the provided account data to discover trends, correlations, and potential issues that may affect account usability.
  Provide a detailed analysis report, highlighting any invalid or unusable credentials and suggestions for optimizing resource allocation and claim protection.

  Account Data: {{{JSON.stringify accountData}}}
  \n  Format the analysis results as a string.`, // Using JSON.stringify to pass the array data
});

const analyzeAccountDistributionFlow = ai.defineFlow(
  {
    name: 'analyzeAccountDistributionFlow',
    inputSchema: AnalyzeAccountDistributionInputSchema,
    outputSchema: AnalyzeAccountDistributionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
