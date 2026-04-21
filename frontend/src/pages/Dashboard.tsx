import { Button, Card, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>
      <Paragraph>Manage students, teachers, parents, schedules, attendance, scores, and more.</Paragraph>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="Students">
            <Button type="primary" onClick={() => navigate('/admin/students')}>
              Manage Students
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Teachers">
            <Button type="primary" onClick={() => navigate('/admin/teachers')}>
              Manage Teachers
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Parents">
            <Button type="primary" onClick={() => navigate('/admin/parents')}>
              Manage Parents
            </Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Schedule">
            <Button type="primary" onClick={() => navigate('/admin/schedules')}>
              Manage Schedule
            </Button>
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 24 }}>
        <Paragraph strong>Logged in as:</Paragraph>
        <Paragraph>{role}</Paragraph>
      </div>
    </div>
  );
};

export default Dashboard;
