import { Card, Empty, Space, Typography } from 'antd';
import { ImageList } from '../../common/ImageList';
import type { AssetResource, TaskStageOutput } from '../../../types';
import { stringifyTaskOutput } from '../../../utils/task';
import styles from './index.module.less';

const { Paragraph } = Typography;

interface StageOutputSectionProps {
  output: TaskStageOutput | null;
}

function getImageGeneratingPreviewImages(output: TaskStageOutput): AssetResource[] {
  if (output.stageName !== 'image_generating' || !Array.isArray(output.output)) {
    return [];
  }

  return output.output.flatMap((item, index) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as {
      shotId?: unknown;
      image?: unknown;
    };

    if (typeof record.image !== 'string' || !record.image.trim()) {
      return [];
    }

    const shotId = typeof record.shotId === 'string' && record.shotId.trim()
      ? record.shotId.trim()
      : `shot_${index + 1}`;

    return [{
      _id: `stage-output-image-${shotId}`,
      name: `${shotId}.png`,
      mimeType: 'image/png',
      size: 0,
      url: record.image,
      createdAt: output.generatedAt,
    }];
  });
}

export function StageOutputSection(props: StageOutputSectionProps) {
  const { output } = props;

  if (!output) {
    return null;
  }

  const previewImages = getImageGeneratingPreviewImages(output);

  return (
    <Space direction="vertical" size={16} className={styles.root}>
      <Card variant="borderless" className={styles.card} title="阶段输入">
        {Object.keys(output.input).length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该阶段没有输入快照" />
        ) : (
          <Paragraph className={styles.jsonPanel}>
            <pre>{stringifyTaskOutput(output.input)}</pre>
          </Paragraph>
        )}
      </Card>

      <Card variant="borderless" className={styles.card} title="阶段输出">
        <Paragraph className={styles.jsonPanel}>
          <pre>{stringifyTaskOutput(output.output)}</pre>
        </Paragraph>
      </Card>

      {previewImages.length > 0 ? (
        <Card variant="borderless" className={styles.card} title="生成的图片预览">
          <ImageList images={previewImages} maxVisibleCount={previewImages.length} />
        </Card>
      ) : null}
    </Space>
  );
}
