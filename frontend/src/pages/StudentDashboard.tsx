import { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Typography, message } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

const StudentDashboard = () => {
  const [scores, setScores] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [scoreRes, scheduleRes] = await Promise.all([
          api.get('/scores/student/1'),
          api.get('/schedules'),
        ]);
        setScores(scoreRes.data);
        setSchedule(scheduleRes.data);
      } catch (error) {
        message.error('Failed to load student data');
      }
    };
    load();
  }, []);

  const scoreColumns = [
    { title: 'Subject', dataIndex: ['subject', 'name'], key: 'subject' },
    { title: 'Final 1', dataIndex: 'final1', key: 'final1' },
    { title: 'Final 2', dataIndex: 'final2', key: 'final2' },
  ];

  const scheduleColumns = [
    { title: 'Day', dataIndex: 'dayOfWeek', key: 'dayOfWeek' },
    { title: 'Period', dataIndex: 'period', key: 'period' },
    { title: 'Subject', dataIndex: ['subject', 'name'], key: 'subject' },
  ];

  return (
    <div>
      <Title level={2}>Student Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Scores" bordered>
            <Table rowKey="id" columns={scoreColumns} dataSource={scores} pagination={false} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Schedule" bordered>
            <Table rowKey="id" columns={scheduleColumns} dataSource={schedule} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
