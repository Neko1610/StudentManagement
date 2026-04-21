import { Card, Row, Col, Statistic, Spin, Typography, Space, Table, Tag, Avatar, Button } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  DashboardOutlined,
  SolutionOutlined,
  ArrowUpOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    parentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [students, teachers, parents] = await Promise.all([
        adminService.getStudents(),
        adminService.getTeachers(),
        adminService.getParents(),
      ]);

      setStats({
        studentCount: students.length,
        teacherCount: teachers.length,
        parentCount: parents.length,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hoạt động gần đây (Mock data theo mẫu UI)
  const recentActivity = [
    { key: '1', student: 'Alex Rivera', action: 'New Registration', class: 'Advanced Physics II', date: '2 mins ago', status: 'Enrolled' },
    { key: '2', student: 'Sarah Jenkins', action: 'Profile Edit', class: 'Humanities 101', date: '45 mins ago', status: 'Updated' },
    { key: '3', student: 'Marcus Thorne', action: 'Fee Payment', class: 'Business Law', date: '2 hours ago', status: 'Completed' },
  ];

  const columns = [
    {
      title: 'STUDENT',
      dataIndex: 'student',
      render: (text: string) => (
        <Space>
          <Avatar src={`https://i.pravatar.cc/150?u=${text}`} />
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
        </Space>
      ),
    },
    { title: 'ACTION', dataIndex: 'action', render: (text: string) => <Text style={{ fontSize: '12px' }}>{text}</Text> },
    { title: 'COURSE/CLASS', dataIndex: 'class', render: (text: string) => <Text style={{ fontSize: '12px' }}>{text}</Text> },
    { title: 'DATE', dataIndex: 'date', render: (text: string) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text> },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'Enrolled' || status === 'Completed' ? 'green' : 'blue'} style={{ borderRadius: '6px', fontWeight: 600 }}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Styles đồng bộ mẫu UI
  const cardStyle = {
    borderRadius: '16px',
    border: 'none',
    boxShadow: '0 10px 30px rgba(25, 28, 29, 0.04)',
    background: '#ffffff',
  };

  const iconContainerStyle = (color: string) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    fontSize: '20px',
    marginBottom: '16px'
  });

  return (
    <Spin spinning={loading} size="large">
      <div style={{ padding: '40px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <Space direction="vertical" size={0}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontFamily: '"Manrope", sans-serif', letterSpacing: '-0.025em' }}>
              System Overview
            </Title>
            <Text style={{ color: '#464555', fontSize: '15px' }}>
              Real-time performance analytics for the 2024 academic year.
            </Text>
          </Space>
        </div>

        {/* Statistics Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {[
            { label: 'TOTAL STUDENTS', value: stats.studentCount, color: '#3525cd', icon: <TeamOutlined />, trend: '+12%' },
            { label: 'TOTAL TEACHERS', value: stats.teacherCount, color: '#58579b', icon: <UserOutlined />, trend: '+3' },
            { label: 'TOTAL PARENTS', value: stats.parentCount, color: '#7e3000', icon: <SolutionOutlined />, trend: 'Stable' },
          ].map((item, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <Card style={{ ...cardStyle, borderLeft: `4px solid ${item.color}` }} bodyStyle={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={iconContainerStyle(item.color)}>{item.icon}</div>
                  <Tag color="green" style={{ borderRadius: '20px', border: 'none', fontWeight: 700 }}>{item.trend}</Tag>
                </div>
                <Statistic
                  title={<Text strong style={{ color: '#464555', fontSize: '11px', letterSpacing: '0.1em' }}>{item.label}</Text>}
                  value={item.value}
                  valueStyle={{ fontWeight: 800, fontSize: '32px', color: '#191c1d', fontFamily: '"Manrope", sans-serif' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recent Activity Table */}
        <Card 
          style={cardStyle} 
          title={<Title level={4} style={{ margin: 0, fontWeight: 700 }}>Recent Activity</Title>}
          extra={<Button type="link" style={{ fontWeight: 700, color: '#3525cd' }}>View All Registry</Button>}
          bodyStyle={{ padding: 0 }}
        >
          <Table 
            columns={columns} 
            dataSource={recentActivity} 
            pagination={false} 
            style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden' }}
          />
        </Card>
      </div>
    </Spin>
  );
}