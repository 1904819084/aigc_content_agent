import { Card, Descriptions, Empty, Space, Tag, Typography } from 'antd';
import type { ReactNode } from 'react';
import type { TaskStageOutput } from '../../../types';
import { stringifyTaskOutput } from '../../../utils/task';
import styles from './index.module.less';

const { Link, Paragraph, Text } = Typography;

const TASK_STAGE_FIELD_LABELS: Record<string, string> = {
  productName: '商品名称',
  productImages: '商品图片',
  videoPrompt: '补充 Prompt',
  storyboard: '分镜脚本',
  video_script: '剧本内容',
  videoList: '分镜视频',
  video: '视频链接',
  image: '图片链接',
  title: '标题',
  hook: '开场钩子',
  positioning: '内容定位',
  sections: '脚本段落',
  cta: '行动引导',
  heading: '段落标题',
  narration: '旁白',
  shotId: '分镜 ID',
  duration: '时长',
  shotType: '镜头类型',
  visual: '画面描述',
  subtitle: '字幕',
  cameraMotion: '运镜',
  imagePrompt: '分镜图提示词',
  videoPromptList: '视频提示词列表',
  imagePromptList: '图片提示词列表',
  ImageList: '分镜图',
  VideoPromptList: '视频提示词列表',
  StoryboardShot: '分镜脚本',
  result: '质检结果',
  legal: '合规说明',
  unlegal: '风险说明',
  suggestion: '优化建议',
};

interface StageOutputSectionProps {
  output: TaskStageOutput | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function formatFieldLabel(key: string) {
  if (TASK_STAGE_FIELD_LABELS[key]) {
    return TASK_STAGE_FIELD_LABELS[key];
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrimitiveValue(value: string | number | boolean) {
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }

  return String(value);
}

function getOutputKindLabel(value: unknown) {
  if (Array.isArray(value)) {
    return `数组 (${value.length})`;
  }

  if (isPlainObject(value)) {
    return `对象 (${Object.keys(value).length})`;
  }

  if (value === null || typeof value === 'undefined') {
    return '空值';
  }

  return typeof value;
}

function getStageOverviewItems(output: TaskStageOutput) {
  return [
    {
      key: 'version',
      label: '版本',
      children: output.version,
    },
    {
      key: 'generatedAt',
      label: '生成时间',
      children: new Date(output.generatedAt).toLocaleString('zh-CN'),
    },
    {
      key: 'inputKeys',
      label: '输入字段数',
      children: Object.keys(output.input).length,
    },
    {
      key: 'outputKind',
      label: '产出类型',
      children: getOutputKindLabel(output.output),
    },
  ];
}

function getDescriptionItems(record: Record<string, unknown>) {
  return Object.entries(record).map(([key, value]) => ({
    key,
    label: formatFieldLabel(key),
    children: renderValue(value),
  }));
}

function getArrayItemTitle(value: unknown, index: number) {
  if (isPlainObject(value)) {
    if (typeof value.shotId === 'string' && value.shotId.trim()) {
      return `分镜 ${value.shotId}`;
    }

    if (typeof value.heading === 'string' && value.heading.trim()) {
      return value.heading;
    }

    if (typeof value.title === 'string' && value.title.trim()) {
      return value.title;
    }

    if (typeof value.result === 'string' && value.result.trim()) {
      return `结果 ${index + 1}`;
    }
  }

  return `条目 ${index + 1}`;
}

function renderPrimitive(value: string | number | boolean) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) {
    return (
      <Link href={value} target="_blank" rel="noreferrer" className={styles.resourceLink}>
        {value}
      </Link>
    );
  }

  return <span className={styles.inlineValue}>{formatPrimitiveValue(value)}</span>;
}

function renderArray(values: unknown[]) {
  if (values.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数组数据" />;
  }

  const primitiveValues = values.every((value) => ['string', 'number', 'boolean'].includes(typeof value));

  if (primitiveValues) {
    return (
      <Space wrap size={[8, 8]}>
        {values.map((value, index) => (
          <Tag key={`${String(value)}-${index}`} className={styles.valueTag}>
            {formatPrimitiveValue(value as string | number | boolean)}
          </Tag>
        ))}
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={12} className={styles.section}>
      {values.map((value, index) => (
        <div key={index} className={styles.listItem}>
          <Text strong className={styles.listItemTitle}>
            {getArrayItemTitle(value, index)}
          </Text>
          <div className={styles.listItemBody}>{renderValue(value)}</div>
        </div>
      ))}
    </Space>
  );
}

function renderObject(value: Record<string, unknown>) {
  const items = getDescriptionItems(value);

  if (items.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无对象字段" />;
  }

  return <Descriptions size="small" column={1} items={items} />;
}

function renderValue(value: unknown): ReactNode {
  if (value === null || typeof value === 'undefined') {
    return <Text type="secondary">暂无</Text>;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return renderPrimitive(value);
  }

  if (Array.isArray(value)) {
    return renderArray(value);
  }

  if (isPlainObject(value)) {
    return renderObject(value);
  }

  return <span className={styles.inlineValue}>{String(value)}</span>;
}

export function StageOutputSection(props: StageOutputSectionProps) {
  const { output } = props;

  if (!output) {
    return null;
  }

  return (
    <Space direction="vertical" size={16} className={styles.root}>
      <Card variant="borderless" className={styles.card} title="阶段概览">
        <Descriptions size="small" column={1} items={getStageOverviewItems(output)} />
      </Card>

      <Card variant="borderless" className={styles.card} title="阶段输入">
        {Object.keys(output.input).length > 0 ? (
          <Descriptions size="small" column={1} items={getDescriptionItems(output.input)} />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该阶段没有输入快照" />
        )}
      </Card>

      <Card variant="borderless" className={styles.card} title="阶段产出">
        {renderValue(output.output)}
      </Card>

      <Card variant="borderless" className={styles.card} title="原始结果">
        <Paragraph className={styles.jsonPanel}>
          <pre>{stringifyTaskOutput(output.output)}</pre>
        </Paragraph>
      </Card>
    </Space>
  );
}
