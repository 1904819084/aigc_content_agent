import { fornaxExecute } from '../../fornax/llm';
import { Task } from '../../types';

const PROMPT_KEY = 'demo.script_generate_agent.prompt';
//不指定version会默认选择最新版本
// const PROMPT_VERSION = '0.0.1';

// 剧本生成结果类型
type ScriptResult = {
  title: string;
  hook: string;
  positioning: string;
  sections: ScriptSection[];
  cta: string;
};

type ScriptSection = {
  heading: string;
  narration: string;
};

const FIELD_ALIASES = {
  title: ['title', '标题', '剧本标题', '脚本标题'],
  hook: ['hook', '开场钩子', '钩子', '开头', '开场'],
  positioning: ['positioning', '定位', '内容定位', '人群定位', '产品定位'],
  cta: ['cta', '行动引导', '结尾引导', '转化引导', 'calltoaction'],
  sections: ['sections', 'section', '正文', '剧本内容', '脚本内容', '分段', '内容'],
} as const;

function normalizeTextLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeFieldLabel(label: string) {
  return label.replace(/[*#\s\-_.]/g, '').toLowerCase();
}

function matchFieldKey(label: string): keyof typeof FIELD_ALIASES | null {
  const normalizedLabel = normalizeFieldLabel(label);
  const fieldKeys = Object.keys(FIELD_ALIASES) as Array<keyof typeof FIELD_ALIASES>;

  for (const fieldKey of fieldKeys) {
    const aliases = FIELD_ALIASES[fieldKey];
    if (aliases.some((alias: string) => normalizeFieldLabel(alias) === normalizedLabel)) {
      return fieldKey;
    }
  }

  return null;
}

function parseLabeledFields(text: string) {
  const lines = text.split('\n');
  const result: Partial<Record<keyof typeof FIELD_ALIASES, string>> = {};
  let currentField: keyof typeof FIELD_ALIASES | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      currentField = null;
      continue;
    }

    const matched = line.match(/^(?:[-*]\s*)?(?:#{1,6}\s*)?(?:\*\*)?([^:：]+?)(?:\*\*)?\s*[:：]\s*(.*)$/);
    if (matched) {
      const fieldKey = matchFieldKey(matched[1]);
      if (fieldKey) {
        result[fieldKey] = matched[2].trim();
        currentField = fieldKey;
        continue;
      }
    }

    if (currentField) {
      result[currentField] = result[currentField]
        ? `${result[currentField]}\n${line}`
        : line;
    }
  }

  return result;
}

function parseSectionsFromParagraphs(text: string) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return [];
  }

  return blocks.map((block, index) => {
    const lines = normalizeTextLines(block);
    const firstLine = lines[0] ?? '';
    const headingMatch = firstLine.match(/^(?:#{1,6}\s*)?(?:[-*]\s*)?([^:：]{1,20})[:：]\s*(.*)$/);

    if (headingMatch) {
      const narrationLines = [headingMatch[2], ...lines.slice(1)].filter(Boolean);
      return {
        heading: headingMatch[1].trim(),
        narration: narrationLines.join('\n').trim(),
      };
    }

    return {
      heading: `第${index + 1}段`,
      narration: lines.join('\n'),
    };
  });
}

function buildSectionsFromFields(fields: Partial<Record<keyof typeof FIELD_ALIASES, string>>) {
  const sections: ScriptSection[] = [];

  if (fields.hook) {
    sections.push({ heading: '开场钩子', narration: fields.hook });
  }

  if (fields.sections) {
    sections.push(...parseSectionsFromParagraphs(fields.sections));
  }

  if (fields.positioning) {
    sections.push({ heading: '内容定位', narration: fields.positioning });
  }

  if (fields.cta) {
    sections.push({ heading: '行动引导', narration: fields.cta });
  }

  return sections.filter((section) => section.narration.trim());
}

function buildScriptResultFromText(task: Task, text: string): ScriptResult {
  const fields = parseLabeledFields(text);
  const sections =
    buildSectionsFromFields(fields).length > 0
      ? buildSectionsFromFields(fields)
      : parseSectionsFromParagraphs(text);
  const plainText = text.trim();

  return {
    title: fields.title?.trim() || normalizeTextLines(text)[0] || task.brief.productName,
    hook: fields.hook?.trim() || sections[0]?.narration || plainText,
    positioning: fields.positioning?.trim() || plainText,
    sections: sections.length > 0 ? sections : [{ heading: '正文', narration: plainText }],
    cta: fields.cta?.trim() || sections[sections.length - 1]?.narration || plainText,
  };
}

export async function runScriptGeneratingAgent(task: Task) {
  const brief = task.brief;

  try {

    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        productName: brief.productName,
        productImage: brief.productImages || undefined,
        videoPrompt: brief.videoPrompt || '',
      },
      callOptions: {},
    });

    if (!response.ok || !response.text) {
      throw Object.assign(
        new Error(typeof response.error === 'string' && response.error ? response.error : 'fornax_execute_failed'),
        { statusCode: 502 },
      );
    }

    const result = buildScriptResultFromText(task, response.text);

    return {
      input: {
        productName: brief.productName,
        productImage: brief.productImages || undefined,
        videoPrompt: brief.videoPrompt ? brief.videoPrompt : '无补充提示词'
      },
      summary: [
        { label: '剧本标题', value: result.title },
        { label: '开场钩子', value: result.hook },
        { label: '结尾引导', value: result.cta },
      ],
      metrics: [
        { label: '分镜数量', value: result.sections.length },
        { label: '商品图片数量', value: brief.productImages?.length ?? '0' },
      ],
      result,
    };
  } catch (error) {
    throw Object.assign(
      error instanceof Error ? error : new Error('fornax_script_generating_failed'),
      {
        statusCode:
          typeof (error as { statusCode?: unknown })?.statusCode === 'number'
            ? ((error as { statusCode: number }).statusCode ?? 502)
            : 502,
      },
    );
  }
}
