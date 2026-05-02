import { BellOutlined } from '@ant-design/icons';
import { Card, List, Space, Spin, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { notificationService } from '../../api/notificationService';
import { Notification } from '../../types';

const { Title, Text } = Typography;

export default function StudentNotifications() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMine();
      setNotifications(data || []);
    } catch (error) {
      message.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Notifications</Title>
            <div className="page-subtitle">Read-only school updates and class announcements.</div>
          </div>
        </div>

        <Card title={<Space><BellOutlined /> My Notifications</Space>}>
          <List
            dataSource={notifications}
            locale={{ emptyText: 'No notifications' }}
            renderItem={(item) => (
              <List.Item className="soft-list-item">
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Text strong>{item.title}</Text>
                      <Tag color={item.type === 'IMPORTANT' ? 'red' : item.type === 'WARNING' ? 'gold' : 'blue'}>
                        {item.type}
                      </Tag>
                      {!item.isRead && <Tag color="green">New</Tag>}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text>{item.content || item.message}</Text>
                      <Text type="secondary">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </Spin>
  );
}
