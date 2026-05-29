import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Empty, Space, Spin, Tabs, Tag, Typography } from 'antd';
import JsonView from '@uiw/react-json-view';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../../components/common/AppShell';
import { PageHero } from '../../components/common/PageHero';
import { TASK_STAGE_LABELS } from '../../constants/task';
import { useSubAgentDetail } from '../../hooks/useSubAgentDetail';
import styles from './index.module.less';

const { Paragraph, Text } = Typography;

export function SubAgentDetailPage() {
  const { name } = useParams();
  const { detail, loading, error } = useSubAgentDetail(name);

  return (
    <AppShell
      header={
        <PageHero
          eyebrow="SubAgent Detail"
          title={detail?.displayName ?? 'SubAgent 详情'}
          description="查看 Fornax 上配置的 system / user prompt 模板与版本信息。"
          compact
          actions={
            <Space style={{ marginTop: 16 }}>
              <Link to="/subagents">
                <Button icon={<ArrowLeftOutlined />}>返回 SubAgent 列表</Button>
              </Link>
            </Space>
          }
          extra={
            detail ? (
              <div className="heroHighlightCard compactHighlight">
                <Text className="heroHighlightLabel">Prompt 版本</Text>
                <div className="heroHighlightStats">
                  <div>
                    <div className="heroHighlightValue">
                      {detail.prompt?.version ?? '—'}
                    </div>
                    <div className="heroHighlightHint">当前环境最新版本</div>
                  </div>
                </div>
                <Paragraph className="heroHighlightDesc">
                  来源：Fornax PromptHub
                </Paragraph>
              </div>
            ) : null
          }
        />
      }
      mainClassName="singleColumnLayout"
    >
      {loading && !detail ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Card variant="borderless" className="taskSectionCard">
          <Alert type="error" showIcon message="SubAgent 详情加载失败" description={error} />
        </Card>
      ) : !detail ? (
        <Card variant="borderless" className="taskSectionCard">
          <Empty description="SubAgent 不存在" />
        </Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card variant="borderless" className="taskSectionCard" title="基础信息">
            <Descriptions
              column={1}
              items={[
                { key: 'displayName', label: '名称', children: detail.displayName },
                {
                  key: 'stageNames',
                  label: '对应阶段',
                  children: detail.stageNames.map((s) => TASK_STAGE_LABELS[s]).join(' / '),
                },
                {
                  key: 'promptKey',
                  label: 'Prompt Key',
                  children: <code className={styles.metaTag}>{detail.promptKey}</code>,
                },
                {
                  key: 'version',
                  label: 'Prompt 版本',
                  children: (
                    <code className={styles.metaTag}>{detail.prompt?.version ?? '未知'}</code>
                  ),
                },
                { key: 'description', label: '描述', children: detail.description },
              ]}
            />
          </Card>

          {detail.error ? (
            <Alert
              type="warning"
              showIcon
              message="无法从 Fornax 拉取 prompt"
              description={detail.error}
            />
          ) : null}

          {detail.prompt?.modelConfig ? (
            <Card variant="borderless" className="taskSectionCard" title="模型配置">
              <Descriptions
                column={{ xs: 1, sm: 2, lg: 3 }}
                items={[
                  {
                    key: 'name',
                    label: '模型名称',
                    children: detail.prompt.modelConfig.name ? (
                      <Tag color="geekblue">{detail.prompt.modelConfig.name}</Tag>
                    ) : (
                      '—'
                    ),
                  },
                  {
                    key: 'maxTokens',
                    label: 'Max Tokens',
                    children: detail.prompt.modelConfig.maxTokens ?? '—',
                  },
                  {
                    key: 'temperature',
                    label: 'Temperature',
                    children: detail.prompt.modelConfig.temperature ?? '—',
                  },
                  {
                    key: 'topP',
                    label: 'Top P',
                    children: detail.prompt.modelConfig.topP ?? '—',
                  },
                  {
                    key: 'thinking',
                    label: 'Thinking',
                    children: detail.prompt.modelConfig.thinking ? (
                      <Tag color={detail.prompt.modelConfig.thinking.enabled ? 'green' : 'default'}>
                        {detail.prompt.modelConfig.thinking.enabled ? 'Enabled' : 'Disabled'}
                        {detail.prompt.modelConfig.thinking.option != null
                          ? ` · option=${detail.prompt.modelConfig.thinking.option}`
                          : ''}
                      </Tag>
                    ) : (
                      '—'
                    ),
                  },
                ]}
              />
            </Card>
          ) : null}

          {detail.prompt ? (
            <Card variant="borderless" className="taskSectionCard" title="Prompt 内容">
              <Tabs
                items={[
                  {
                    key: 'system',
                    label: 'System Prompt',
                    children: detail.prompt.system ? (
                      <pre className={styles.promptBlock}>{detail.prompt.system}</pre>
                    ) : (
                      <Empty description="无 system prompt" />
                    ),
                  },
                  {
                    key: 'user',
                    label: 'User Prompt',
                    children: detail.prompt.user ? (
                      <pre className={styles.promptBlock}>{detail.prompt.user}</pre>
                    ) : (
                      <Empty description="无 user prompt" />
                    ),
                  },
                  {
                    key: 'raw',
                    label: 'Raw JSON',
                    children: (
                      <JsonView value={(detail.prompt.raw ?? {}) as object} collapsed={2} />
                    ),
                  },
                ]}
              />
            </Card>
          ) : null}
        </Space>
      )}
    </AppShell>
  );
}

export default SubAgentDetailPage;
