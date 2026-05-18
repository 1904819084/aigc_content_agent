import { InboxOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Space, Typography, Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState, type ChangeEvent } from 'react';
import type { TaskBrief } from '../../../types';
import styles from './index.module.less';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

interface CreateTaskModalProps {
  open: boolean;
  draftTask: TaskBrief;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onChange: (draftTask: TaskBrief) => void;
  onSubmit: (files: File[]) => void;
}

export function CreateTaskModal(props: CreateTaskModalProps) {
  const { open, draftTask, submitting, error, onCancel, onChange, onSubmit } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) {
      setFileList([]);
    }
  }, [open]);

  function handleBeforeUpload() {
    return false;
  }

  function handleUploadChange(nextFileList: UploadFile[]) {
    setFileList(nextFileList.slice(-3));
  }

  function handleRemove(file: UploadFile) {
    setFileList((currentFileList) => {
      return currentFileList.filter((item) => item.uid !== file.uid);
    });
  }

  function handleProductNameChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({
      ...draftTask,
      productName: event.target.value,
    });
  }

  function handleVideoPromptChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange({
      ...draftTask,
      videoPrompt: event.target.value,
    });
  }

  function handleSubmit() {
    const files = fileList
      .map((file) => file.originFileObj)
      .filter((file): file is RcFile => Boolean(file));

    if (files.length > 3) {
      return;
    }

    onSubmit(files);
  }

  return (
    <Modal
      open={open}
      title="创建带货短视频任务"
      okText={submitting ? '创建中...' : '创建并启动'}
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={720}
      destroyOnHidden
      className={styles.modal}
    >
      <Space direction="vertical" size={20} className={styles.content}>
        <Paragraph type="secondary" className={styles.description}>
          输入商品信息后，系统会自动启动电商带货短视频
          Agent，从脚本、分镜到视频混剪与质检全链路生成。
        </Paragraph>
        <Form layout="vertical">
          <Form.Item label="商品名" required name="productName">
            <Input
              name="productName"
              value={draftTask.productName}
              placeholder="例如：轻薄持妆粉底液"
              onChange={handleProductNameChange}
            />
          </Form.Item>
          <Form.Item
            label="商品图片"
            name="productImages"
            extra="支持 0-3 张图片，建议上传主体清晰的商品图。"
          >
            <Upload.Dragger
              accept="image/*"
              multiple
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onChange={(info) => handleUploadChange(info.fileList)}
              onRemove={handleRemove}
              maxCount={3}
              listType="picture"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽上传商品图片</p>
              <p className="ant-upload-hint">最多 3 张，当前已选择 {fileList.length} 张</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="短视频 Prompt" name="videoPrompt" style={{ marginBottom: 0 }}>
            <TextArea
              name="videoPrompt"
              value={draftTask.videoPrompt}
              placeholder="例如：偏高级感美妆广告风，突出遮瑕前后对比和上脸质感。"
              autoSize={{ minRows: 4, maxRows: 6 }}
              onChange={handleVideoPromptChange}
            />
          </Form.Item>
        </Form>
        {error ? (
          <Text type="danger" className={styles.errorMessage}>
            {error}
          </Text>
        ) : null}
      </Space>
    </Modal>
  );
}
