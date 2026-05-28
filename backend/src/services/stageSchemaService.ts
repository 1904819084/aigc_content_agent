import { z } from 'zod';
import type { StageOutputMap, TaskStageName } from '../types';

const trimmedString = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1));

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string());

const scriptSectionSchema = z.object({
  heading: z.string(),
  narration: z.string(),
});

export const scriptResultSchema = z.object({
  title: trimmedString,
  hook: trimmedString,
  positioning: trimmedString,
  sections: z.array(scriptSectionSchema).min(1),
  cta: trimmedString,
});

export const storyboardResultSchema = z
  .object({
    shots: z
      .array(
        z.object({
          shotId: trimmedString,
          duration: z.number().positive(),
          shotType: trimmedString,
          visual: trimmedString,
          narration: optionalTrimmedString,
          subtitle: optionalTrimmedString,
          cameraMotion: optionalTrimmedString,
        }),
      )
      .min(1),
  })
  .transform((value) => value.shots);

export const imagePromptResultSchema = z
  .array(
    z.object({
      shotId: trimmedString,
      imagePrompt: trimmedString,
    }),
  )
  .min(1);

export const imageGeneratingResultSchema = z
  .array(
    z.object({
      shotId: trimmedString,
      image: trimmedString,
    }),
  )
  .min(1);

export const videoPromptResultSchema = z
  .array(
    z.object({
      shotId: trimmedString,
      videoPrompt: trimmedString,
    }),
  )
  .min(1);

export const videoGeneratingResultSchema = z
  .array(
    z.object({
      shotId: trimmedString,
      video: z.string().url(),
      duration: z.number().positive().default(5),
    }),
  )
  .min(1);

export const editingResultSchema = z.object({
  video: z.string().url(),
});

export const qaReviewResultSchema = z.object({
  decision: z.enum(['pass', 'fail']),
  targetStage: z.enum(['image_generating', 'video_generating', 'editing']),
  score: z.number().finite(),
  reasons: z.string().default(''),
  suggestions: z.string().default(''),
});

export const STAGE_OUTPUT_SCHEMAS: Record<TaskStageName, z.ZodTypeAny> = {
  script_generating: scriptResultSchema,
  storyboard_generating: storyboardResultSchema,
  image_prompt_generating: imagePromptResultSchema,
  image_generating: imageGeneratingResultSchema,
  image_qa_reviewing: qaReviewResultSchema,
  video_prompt_generating: videoPromptResultSchema,
  video_generating: videoGeneratingResultSchema,
  video_qa_reviewing: qaReviewResultSchema,
  editing: editingResultSchema,
  editing_qa_reviewing: qaReviewResultSchema,
};

export function getStageOutputSchema<S extends TaskStageName>(
  stageName: S,
): z.ZodType<StageOutputMap[S]> {
  return STAGE_OUTPUT_SCHEMAS[stageName] as z.ZodType<StageOutputMap[S]>;
}

export function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ');
}
