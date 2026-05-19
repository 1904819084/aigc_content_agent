// 合法化 http/https URL，并尽量移除尾部脏字符
export function sanitizeHttpUrl(value: string) {
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    const matchedUrl = trimmed.match(/https?:\/\/[^\s"'`<>]+/i)?.[0] ?? '';
    if (!matchedUrl) {
      return '';
    }
    return matchedUrl.replace(/[)\],.;:*]+$/g, '');
  }
}
