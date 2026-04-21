import { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Typography, message } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

const ParentDashboard = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tuitions, setTuitions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [notificationRes, tuitionRes] = await Promise.all([
          api.get('/notifications/role/PARENT'),
          api.get('/tuitions'),
        ]);
        setNotifications(notificationRes.data);
        setTuitions(tuitionRes.data);
      } catch (error) {
        message.error('Failed to load parent data');
      }
    };
    load();
  }, []);

  const notificationColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
  ];

  const tuitionColumns = [
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div>
      <Title level={2}>Parent Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Children Tuition" bordered>
            <Table rowKey="id" columns={tuitionColumns} dataSource={tuitions} pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Notifications" bordered>
            <Table rowKey="id" columns={notificationColumns} dataSource={notifications} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ParentDashboard;
