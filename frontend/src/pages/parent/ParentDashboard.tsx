import { Avatar, Button, Card, Col, Empty, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { BellOutlined, CreditCardOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { parentService } from '../../api/parentService';
import { commonService } from '../../api/commonService';
import { auth } from '../../utils/auth';
import { Notification, Student } from '../../types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ParentDashboard() {
  const user = auth.getUser();
  const [children, setChildren] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [childrenData, notificationsData] = await Promise.all([
        parentService.getChildren(user?.email || ''),
        commonService.getNotifications(),
      ]);

      setChildren(childrenData);
      setNotifications(notificationsData.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Welcome, {user?.fullName}</Title>
            <div className="page-subtitle">
              Track children, tuition, requests, and school updates in one calm workspace.
            </div>
          </div>
          <Button type="primary" onClick={() => navigate('/parent/students')}>
            View students
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                <TeamOutlined />
              </div>
              <Statistic title="My Children" value={children.length} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#2563eb', background: '#dbeafe' }}>
                <BellOutlined />
              </div>
              <Statistic title="Unread Messages" value={unreadCount} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#0f766e', background: '#ccfbf1' }}>
                <CreditCardOutlined />
              </div>
              <Statistic title="Tuition" value="Open" />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#9333ea', background: '#f3e8ff' }}>
                <FileTextOutlined />
              </div>
              <Statistic title="Requests" value="Ready" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={13}>
            <Card title="My Children">
              {children.length === 0 ? (
                <Empty description="No children" />
              ) : (
                <List
                  dataSource={children}
                  renderItem={(child) => (
                    <List.Item className="soft-list-item">
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: '#eef2ff', color: '#4f46e5' }}>{child.fullName?.charAt(0)}</Avatar>}
                        title={<Text strong>{child.fullName}</Text>}
                        description={<Text type="secondary">Class: {child.className || 'N/A'}</Text>}
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => navigate(`/parent/students?studentId=${child.id}`)}
                      >
                        Details
                      </Button>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={11}>
            <Card title="Recent Notifications">
              {notifications.length === 0 ? (
                <Empty description="No notifications" />
              ) : (
                <List
                  dataSource={notifications}
                  renderItem={(notification) => (
                    <List.Item className="soft-list-item">
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{notification.title}</Text>
                            {!notification.isRead && <Tag color="blue">New</Tag>}
                          </Space>
                        }
                        description={notification.content}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
