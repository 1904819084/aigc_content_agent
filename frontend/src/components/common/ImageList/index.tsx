import { Image, Typography } from 'antd';
import type { AssetResource } from '../../../types';
import styles from './index.module.less';

const { Text } = Typography;

interface ImageListProps {
  images: AssetResource[];
  maxVisibleCount?: number;
}

const IMAGE_LIST_DEFAULT_VISIBLE_COUNT = 3;

export function ImageList(props: ImageListProps) {
  const { images, maxVisibleCount = IMAGE_LIST_DEFAULT_VISIBLE_COUNT } = props;

  if (images.length === 0) {
    return (
      <Text type="secondary" className={styles.empty}>
        无图
      </Text>
    );
  }

  const visibleImages = images.slice(0, maxVisibleCount);
  const remainingCount = images.length - maxVisibleCount;

  return (
    <Image.PreviewGroup>
      <div className={styles.scroller}>
        <div className={styles.list}>
          {visibleImages.map((image, index) => {
            const isLastVisibleImage = index === maxVisibleCount - 1;
            const shouldShowRemainingOverlay = remainingCount > 0 && isLastVisibleImage;

            return (
              <div key={image._id} className={styles.item}>
                <div className={styles.media}>
                  <Image
                    src={image.url}
                    alt={`商品图 ${index + 1}`}
                    className={styles.image}
                    preview={{
                      mask: '预览',
                    }}
                  />
                  {shouldShowRemainingOverlay ? (
                    <div className={styles.overlay}>
                      <span className={styles.overlayCount}>+{remainingCount}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Image.PreviewGroup>
  );
}
