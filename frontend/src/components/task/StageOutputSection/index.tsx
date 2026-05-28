import { Card, Empty, message, Space } from 'antd';
import JsonView from '@uiw/react-json-view';
import { ImageList } from '../../common/ImageList';
import type { AssetResource, TaskStageOutput } from '../../../types';
import styles from './index.module.less';

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
          <div className={styles.jsonPanel}>
            <JsonView
              value={output.input as object}
              collapsed={1}
              displayDataTypes={false}
              displayObjectSize
              enableClipboard
              onCopied={() => message.success('复制成功')}
            />
          </div>
        )}
      </Card>

      <Card variant="borderless" className={styles.card} title="阶段输出">
        <div className={styles.jsonPanel}>
          <JsonView
            value={(typeof output.output === 'object' && output.output !== null
              ? output.output
              : { value: output.output }) as object}
            collapsed={1}
            displayDataTypes={false}
            displayObjectSize
            enableClipboard
            onCopied={() => message.success('复制成功')}
          />
        </div>
      </Card>

      {previewImages.length > 0 ? (
        <Card variant="borderless" className={styles.card} title="生成的图片预览">
          <ImageList images={previewImages} maxVisibleCount={previewImages.length} />
        </Card>
      ) : null}
    </Space>
  );
}
