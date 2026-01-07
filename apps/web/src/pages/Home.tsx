import { Typography, Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <Title level={2}>Dashboard</Title>
        <Paragraph className="text-gray-500">
          Welcome to the Cherry Studio administration panel.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Active Users"
              value={112893}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Idle"
              value={9.3}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total Sales"
              value={93423}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <Card title="Recent Activity" bordered={false} className="shadow-sm">
          <p>User Login: 2023-10-27 10:00:00</p>
          <p>New Order: #123456</p>
          <p>System Update: v2.0.0 released</p>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
