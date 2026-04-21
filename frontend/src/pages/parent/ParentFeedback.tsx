import { Card, List, Empty, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { commonService } from '../../api/commonService';
import { Notification } from '../../types';

export default function ParentFeedback() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await commonService.getNotifications();
      setNotifications(data);
    } catch (error) {
      message.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Feedback from School">
        {notifications.length === 0 ? (
          <Empty description="No feedback" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item>
                <List.Item.Meta
                  title={notification.title}
                  description={
                    <>
                      <p>{notification.content}</p>
                      <small>{new Date(notification.createdAt).toLocaleString()}</small>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Spin>
  );
}
