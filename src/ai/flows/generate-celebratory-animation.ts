'use server';
/**
 * @fileOverview Generates a celebratory animation (confetti or cube spin) as a data URI.
 *
 * - generateCelebratoryAnimation - A function that generates the animation.
 * - GenerateCelebratoryAnimationInput - The input type for the generateCelebratoryAnimation function.
 * - GenerateCelebratoryAnimationOutput - The return type for the generateCelebratoryAnimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCelebratoryAnimationInputSchema = z.object({
  animationType: z
    .enum(['confetti', 'cubeSpin'])
    .describe('The type of animation to generate: confetti or cubeSpin.'),
});
export type GenerateCelebratoryAnimationInput = z.infer<
  typeof GenerateCelebratoryAnimationInputSchema
>;

const GenerateCelebratoryAnimationOutputSchema = z.object({
  animationDataUri: z
    .string()
    .describe(
      'The animation as a data URI that can be used in an HTML img or video tag.'
    ),
});
export type GenerateCelebratoryAnimationOutput = z.infer<
  typeof GenerateCelebratoryAnimationOutputSchema
>;

export async function generateCelebratoryAnimation(
  input: GenerateCelebratoryAnimationInput
): Promise<GenerateCelebratoryAnimationOutput> {
  return generateCelebratoryAnimationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCelebratoryAnimationPrompt',
  input: {schema: GenerateCelebratoryAnimationInputSchema},
  output: {schema: GenerateCelebratoryAnimationOutputSchema},
  prompt: `You are a creative animation generator. You generate animations based on the type given in the input.

  The animation should be returned as a data URI that can be directly embedded in an HTML page.

  Type: {{{animationType}}}

  Return the data URI.
  `,
});

const generateCelebratoryAnimationFlow = ai.defineFlow(
  {
    name: 'generateCelebratoryAnimationFlow',
    inputSchema: GenerateCelebratoryAnimationInputSchema,
    outputSchema: GenerateCelebratoryAnimationOutputSchema,
  },
  async input => {
    // For now, just return a static confetti animation.  In the future, we can use
    // a real animation generation tool like Three.js or similar.
    if (input.animationType === 'confetti') {
      return {
        animationDataUri: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='orange'>🎉</text></svg>`,
      };
    }

    // Or, if cubeSpin, return a different static animation.
    return {
      animationDataUri: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='50' height='50' x='25' y='25' fill='blue' /></svg>`,
    };
  }
);
