import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowUpOutlined,
  ReadOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
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

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadActivity();
  }, []);

  // 🔥 LOAD STATS
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

  // 🔥 LOAD ACTIVITY
  const loadActivity = async () => {
    try {
      const data = await adminService.getActivity();
      setRecentActivity(data || []);
    } catch (e) {
      console.error('Failed to load activity:', e);
    }
  };

  // 🔥 TIME AGO
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;

    return new Date(date).toLocaleDateString();
  };

  // 🔥 TABLE COLUMNS
  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      render: (text: string) => (
        <Space>
          <Avatar src={`https://i.pravatar.cc/150?u=${text}`} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (r: string) => (
        <Tag
          color={
            r === 'ADMIN'
              ? 'red'
              : r === 'TEACHER'
              ? 'blue'
              : r === 'PARENT'
              ? 'green'
              : 'default'
          }
        >
          {r}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
    },
    {
      title: 'Target',
      dataIndex: 'target',
    },
    {
      title: 'Class',
      dataIndex: 'className',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag
          color={
            s === 'Enrolled'
              ? 'green'
              : s === 'Updated'
              ? 'blue'
              : s === 'Pending'
              ? 'gold'
              : s === 'Approved'
              ? 'green'
              : s === 'Rejected'
              ? 'red'
              : 'default'
          }
        >
          {s}
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      render: (t: string) => (
        <Text type="secondary">{timeAgo(t)}</Text>
      ),
    },
  ];

  const statItems = [
    {
      label: 'Students',
      value: stats.studentCount,
      color: '#4f46e5',
      bg: '#eef2ff',
      icon: <TeamOutlined />,
      trend: '+12%',
    },
    {
      label: 'Teachers',
      value: stats.teacherCount,
      color: '#0f766e',
      bg: '#ccfbf1',
      icon: <UserOutlined />,
      trend: '+3',
    },
    {
      label: 'Parents',
      value: stats.parentCount,
      color: '#2563eb',
      bg: '#dbeafe',
      icon: <SolutionOutlined />,
      trend: 'Stable',
    },
  ];

  return (
    <Spin spinning={loading} size="large">
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">
              System Overview
            </Title>
            <div className="page-subtitle">
              Real-time academic operations across students, teachers, and families.
            </div>
          </div>
          <Button type="primary" icon={<ReadOutlined />}>
            Academic Year 2026
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {statItems.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.label}>
              <Card className="stat-card">
                <div
                  className="stat-icon"
                  style={{ color: item.color, background: item.bg }}
                >
                  {item.icon}
                </div>
                <Space
                  align="start"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Statistic
                    title={item.label}
                    value={item.value}
                    valueStyle={{
                      color: '#172033',
                      fontSize: 34,
                      fontWeight: 800,
                    }}
                  />
                  <Tag color="green" icon={<ArrowUpOutlined />}>
                    {item.trend}
                  </Tag>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          title="Recent Activity"
          extra={<Button type="link">View all</Button>}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={recentActivity}
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
          />
        </Card>
      </div>
    </Spin>
  );
}