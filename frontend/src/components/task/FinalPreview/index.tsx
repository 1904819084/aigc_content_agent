import { Card, Empty, Modal } from 'antd';
import {
  LeftOutlined,
  PlayCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { TaskStageName, TaskType } from '../../../constants/task';
import type { Task } from '../../../types';
import styles from './index.module.less';


interface FinalPreviewProps {
  task: Task;
}

interface ImageGeneratingResultItem {
  shotId: string;
  image: string;
}

interface EditingResultItem {
  video: string;
}

function getImageUrls(task: Task): string[] {
  const output = task.outputs?.[TaskStageName.ImageGenerating]?.output as
    | ImageGeneratingResultItem[]
    | undefined;
  if (!Array.isArray(output)) {
    return [];
  }
  return output
    .map((item) => item?.image)
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
}

function getFinalVideoUrl(task: Task): string | null {
  const output = task.outputs?.[TaskStageName.Editing]?.output as
    | EditingResultItem
    | undefined;
  return typeof output?.video === 'string' && output.video.length > 0 ? output.video : null;
}

function ImageTextPreviewModal({
  open,
  images,
  initialIndex,
  onClose,
}: {
  open: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const canSwitch = images.length > 1;

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // 自动轮播
  useEffect(() => {
    if (!open || !canSwitch) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [open, canSwitch, images.length]);

  const handleSwitch = (direction: 'prev' | 'next') => {
    if (!canSwitch) {
      return;
    }
    setCurrentIndex((prev) => {
      if (direction === 'prev') {
        return prev === 0 ? images.length - 1 : prev - 1;
      }
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      destroyOnHidden
      className={styles.modal}
      centered
    >
      <div className={styles.modalContainer}>
        <div className={styles.previewPanel}>
          {images[currentIndex] ? (
            <img className={styles.previewImage} src={images[currentIndex]} alt="" />
          ) : null}
          <div className={styles.previewCount}>
            {currentIndex + 1}/{Math.max(images.length, 1)}
          </div>
          {canSwitch ? (
            <>
              <button
                type="button"
                className={`${styles.switchButton} ${styles.switchLeft}`}
                onClick={() => handleSwitch('prev')}
                aria-label="上一张"
              >
                <LeftOutlined />
              </button>
              <button
                type="button"
                className={`${styles.switchButton} ${styles.switchRight}`}
                onClick={() => handleSwitch('next')}
                aria-label="下一张"
              >
                <RightOutlined />
              </button>
            </>
          ) : null}
        </div>

        <div className={styles.thumbnailList}>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`${styles.thumbnailButton} ${
                currentIndex === index ? styles.thumbnailButtonActive : ''
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <img className={styles.thumbnailImage} src={image} alt="" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ShortVideoPreviewModal({
  open,
  videoUrl,
  onClose,
}: {
  open: boolean;
  videoUrl: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnHidden
      className={styles.modal}
      centered
    >
      <div className={styles.videoModalContainer}>
        <video className={styles.videoPlayer} src={videoUrl} controls autoPlay />
      </div>
    </Modal>
  );
}

export function FinalPreview({ task }: FinalPreviewProps) {
  const [open, setOpen] = useState(false);
  const taskType = task.brief?.taskType ?? TaskType.ShortVideo;

  const images = useMemo(() => getImageUrls(task), [task]);
  const videoUrl = useMemo(() => getFinalVideoUrl(task), [task]);

  const isImageText = taskType === TaskType.ImageText;
  const hasContent = isImageText ? images.length > 0 : Boolean(videoUrl);

  const cardTitle = '最终产物预览';

  if (!hasContent) {
    return (
      <Card variant="borderless" title={cardTitle} className="taskSectionCard">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={isImageText ? '尚未生成图文产物' : '尚未生成短视频产物'}
        />
      </Card>
    );
  }

  return (
    <Card variant="borderless" title={cardTitle} className="taskSectionCard">
      {isImageText ? (
        <button
          type="button"
          className={styles.coverButton}
          onClick={() => setOpen(true)}
        >
          <img className={styles.coverImage} src={images[0]} alt="" />
          <div className={styles.coverMask}>
            <PlayCircleFilled className={styles.coverIcon} />
          </div>
        </button>
      ) : (
        <button
          type="button"
          className={styles.coverButton}
          onClick={() => setOpen(true)}
        >     
          <video className={styles.coverVideo} src={videoUrl ?? undefined} muted preload="metadata" />
          <div className={styles.coverMask}>
            <PlayCircleFilled className={styles.coverIcon} />
          </div>
        </button>
      )}

      {isImageText ? (
        <ImageTextPreviewModal
          open={open}
          images={images}
          initialIndex={0}
          onClose={() => setOpen(false)}
        />
      ) : (
        <ShortVideoPreviewModal
          open={open}
          videoUrl={videoUrl ?? ''}
          onClose={() => setOpen(false)}
        />
      )}
    </Card>
  );
}
