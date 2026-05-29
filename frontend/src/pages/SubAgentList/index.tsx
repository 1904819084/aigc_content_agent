import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Button, Col, Empty, Row, Space, Spin, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/common/AppShell';
import { PageHero } from '../../components/common/PageHero';
import { SubAgentCard } from '../../components/subagent/SubAgentCard';
import { useSubAgentList } from '../../hooks/useSubAgentList';

const { Paragraph, Text } = Typography;

export function SubAgentListPage() {
  const navigate = useNavigate();
  const { subAgents, loading, error } = useSubAgentList();

  return (
    <AppShell
      header={
        <PageHero
          eyebrow="SubAgents Console"
          title="SubAgent 配置中心"
          description="预览每个 SubAgent 在 Fornax 上挂载的 prompt 模板与版本，便于团队协同审阅与调试。"
          actions={
            <Space style={{ marginTop: 16 }}>
              <Link to="/">
                <Button icon={<ArrowLeftOutlined />}>返回任务列表</Button>
              </Link>
            </Space>
          }
          extra={
            <div className="heroHighlightCard">
              <Text className="heroHighlightLabel">已注册 SubAgent</Text>
              <div className="heroHighlightStats">
                <div>
                  <div className="heroHighlightValue">{subAgents.length}</div>
                  <div className="heroHighlightHint">总数</div>
                </div>
              </div>
              <Paragraph className="heroHighlightDesc">
                点击任意卡片查看完整 system / user prompt 与版本信息。
              </Paragraph>
            </div>
          }
        />
      }
      mainClassName="taskCenterLayout"
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          message="SubAgent 列表加载失败"
          description={error}
          style={{ marginBottom: 16 }}
        />
      ) : null}
      {loading && subAgents.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : subAgents.length === 0 ? (
        <Empty description="暂无 SubAgent" />
      ) : (
        <Row gutter={[16, 16]}>
          {subAgents.map((subAgent, index) => (
            <Col key={subAgent.name} xs={24} sm={12} lg={8} xxl={6}>
              <SubAgentCard
                subAgent={subAgent}
                index={index}
                onClick={(item) => navigate(`/subagents/${item.name}`)}
              />
            </Col>
          ))}
        </Row>
      )}
    </AppShell>
  );
}

export default SubAgentListPage;
