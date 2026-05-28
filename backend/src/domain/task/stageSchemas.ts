import { z } from 'zod';
import type { StageOutputMap, TaskStageName } from '../../types';

/**
 * 各 stage 的运行时 schema：单一事实源，z.infer 出来的类型与 StageOutputMap 一一对齐。
 * 每个 stage 的 agent 在解析 LLM 输出时统一通过 STAGE_OUTPUT_SCHEMAS[stageName].safeParse(value) 校验，
 * 替代历史上分散在 agent 内的 buildXxxResultFromJson 手写守卫。
 */

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

/**
 * 每个 stage 对应一个 zod schema。`unknown` 输入 → 精确的 `StageOutputMap[S]` 输出。
 *
 * 内部存储类型用 `z.ZodTypeAny` 是为了规避 zod3 + strict TS 下 transform/default/trim 等链式
 * 操作产生的输入类型与 `StageOutputMap[S]` 静态形状不一致的死锁问题。
 * 出口 `getStageOutputSchema` 会断言为 `z.ZodType<StageOutputMap[S]>`，让调用方拿到精确的
 * `parse` 返回类型；运行时由 schema 自身保证形状正确。
 *
 * 注意：新增 stage 时，TypeScript 会强制此 Record 补齐 key（因为 keys 类型是 TaskStageName）。
 */
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

/**
 * 把 zod 校验失败的 issue 列表压成单行错误信息，方便日志定位 LLM 哪个字段不合法。
 */
export function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ');
}
