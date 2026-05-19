// 从 record 中提取非空字符串字段
export function pickNonEmptyString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

// 提取 agent 输出中的 Markdown 代码块 JSON，若无代码块则返回原始文本
export function extractJsonText(text: string) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fencedMatch ? fencedMatch[1].trim() : trimmed;
}

// 仅移除完整包裹文本的 Markdown 代码围栏，保留普通自然语言输出
export function stripMarkdownCodeFence(text: string) {
  const trimmed = text.trim();
  const codeFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;
}

// 尝试将 agent 输出解析为 JSON，失败时返回 null 供调用方兜底
export function tryParseAgentJson<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(extractJsonText(text)) as T;
  } catch {
    return null;
  }
}
