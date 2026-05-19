// 提取agent 输出中的 Markdown 文本 转换为 JSON 字符串
export function extractJsonText(text: string) {
  const trimmed = text.trim();
  const jsonString = trimmed
  .replace(/```json/g, '')   // 去掉开头 ```json
  .replace(/```/g, '')        // 去掉结尾 ```
  .trim();                    // 去掉多余空格换行
  return jsonString;
}

// 尝试将 agent 输出解析为 JSON，失败时返回 null 供调用方兜底
export function tryParseAgentJson<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(extractJsonText(text)) as T;
  } catch {
    return null;
  }
}

// 仅移除完整包裹文本的 Markdown 代码围栏，保留普通自然语言输出
export function stripMarkdownCodeFence(text: string) {
  const trimmed = text.trim();
  const codeFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;
}
