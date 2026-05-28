import { InboxOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Radio, Space, Typography, Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { TASK_TYPE_LABELS, TaskType } from '../../../constants/task';
import type { TaskBrief } from '../../../types';
import styles from './index.module.less';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

type CreateTaskFormValues = Omit<TaskBrief, 'productImages'>;

interface CreateTaskModalProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (input: CreateTaskFormValues, files: File[]) => Promise<void> | void;
}

const INITIAL_VALUES: CreateTaskFormValues = {
  productName: '',
  inputPrompt: '',
  taskType: TaskType.ShortVideo,
};

export function CreateTaskModal(props: CreateTaskModalProps) {
  const { open, submitting, error, onCancel, onSubmit } = props;
  const [form] = Form.useForm<CreateTaskFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  async function handleSubmit() {
    const values = await form.validateFields();
    const files = fileList
      .map((file) => file.originFileObj)
      .filter((file): file is RcFile => Boolean(file));

    if (files.length > 3) {
      return;
    }

    await onSubmit(values, files);
  }

  return (
    <Modal
      open={open}
      title="创建电商带货内容生成任务"
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
          选择任务类型并输入商品信息后，系统会自动启动对应的内容生成 Agent。
        </Paragraph>
        <Form<CreateTaskFormValues>
          form={form}
          layout="vertical"
          initialValues={INITIAL_VALUES}
          requiredMark
        >
          <Form.Item
            label="任务类型"
            name="taskType"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio.Button value={TaskType.ShortVideo}>
                {TASK_TYPE_LABELS[TaskType.ShortVideo]}
              </Radio.Button>
              <Radio.Button value={TaskType.ImageText}>
                {TASK_TYPE_LABELS[TaskType.ImageText]}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="商品名"
            name="productName"
            rules={[{ required: true, message: '请输入商品名' }]}
          >
            <Input placeholder="例如：轻薄持妆粉底液" />
          </Form.Item>
          <Form.Item label="商品图片" extra="支持 0-3 张图片，建议上传主体清晰的商品图。">
            <Upload.Dragger
              accept="image/*"
              multiple
              fileList={fileList}
              beforeUpload={() => false}
              onChange={(info) => setFileList(info.fileList.slice(-3))}
              onRemove={(file) =>
                setFileList((current) => current.filter((item) => item.uid !== file.uid))
              }
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
          <Form.Item label="输入的 Prompt" name="inputPrompt" style={{ marginBottom: 0 }}>
            <TextArea
              placeholder="例如：偏高级感美妆广告风，突出遮瑕前后对比和上脸质感。"
              autoSize={{ minRows: 4, maxRows: 6 }}
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
