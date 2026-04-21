import { Card, Row, Col, Statistic, Spin, Empty, List, Button, Space } from 'antd';
import { DollarOutlined, TeamOutlined, FileTextOutlined, BellOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { parentService } from '../../api/parentService';
import { commonService } from '../../api/commonService';
import { auth } from '../../utils/auth';
import { Notification, Student } from '../../types';
import { useNavigate } from 'react-router-dom';

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

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1>Welcome, {user?.fullName}</h1>

        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="My Children"
                value={children.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Unread Messages"
                value={notifications.filter((n) => !n.isRead).length}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="My Children">
              {children.length === 0 ? (
                <Empty description="No children" />
              ) : (
                <List
                  dataSource={children}
                  renderItem={(child) => (
                    <List.Item>
                      <List.Item.Meta
                        title={child.fullName}
                        description={`Class: ${child.className || 'N/A'}`}
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => navigate(`/parent/students?studentId=${child.id}`)}
                      >
                        View Details
                      </Button>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Recent Notifications">
              {notifications.length === 0 ? (
                <Empty description="No notifications" />
              ) : (
                <List
                  dataSource={notifications}
                  renderItem={(notification) => (
                    <List.Item>
                      <List.Item.Meta
                        title={notification.title}
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
