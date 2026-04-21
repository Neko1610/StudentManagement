import { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Typography, message } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

const TeacherDashboard = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentRes, notificationRes] = await Promise.all([
          api.get('/assignments'),
          api.get('/notifications/role/TEACHER'),
        ]);
        setAssignments(assignmentRes.data);
        setNotifications(notificationRes.data);
      } catch (error) {
        message.error('Failed to load teacher data');
      }
    };
    load();
  }, []);

  const assignmentColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Deadline', dataIndex: 'deadline', key: 'deadline' },
  ];

  const notificationColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
  ];

  return (
    <div>
      <Title level={2}>Teacher Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Assignments" bordered>
            <Table rowKey="id" columns={assignmentColumns} dataSource={assignments} pagination={false} />
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

export default TeacherDashboard;
