import { BellOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { notificationService } from '../../api/notificationService';
import { Notification } from '../../types';

const { Title } = Typography;

export default function TeacherNotification() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await notificationService.getMine();
    setNotifications(data || []);
  };

  const handleSendNotification = async (values: any) => {
    try {
      setLoading(true);
      await notificationService.send(values);
      message.success('Notification sent to your class');
      form.resetFields();
      await loadNotifications();
    } catch (error) {
      console.error(error);
      message.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Class Notifications</Title>
            <div className="page-subtitle">
              Send updates only to students or parents in your assigned classes.
            </div>
          </div>
        </div>

        <Card title={<Space><BellOutlined /> Send Class Notification</Space>}>
          <Form form={form} layout="vertical" onFinish={handleSendNotification} initialValues={{ type: 'INFO' }}>
            <Form.Item
              label="Recipients"
              name="recipientType"
              rules={[{ required: true, message: 'Select recipients' }]}
            >
              <Select placeholder="Select recipients">
                <Select.Option value="STUDENT">Students in my classes</Select.Option>
                <Select.Option value="PARENT">Parents of my classes</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Enter a title' }]}>
              <Input placeholder="Notification title" />
            </Form.Item>

            <Form.Item label="Message" name="message" rules={[{ required: true, message: 'Enter a message' }]}>
              <Input.TextArea rows={4} placeholder="Notification message" />
            </Form.Item>

            <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Select type' }]}>
              <Select placeholder="Select type">
                <Select.Option value="INFO">Info</Select.Option>
                <Select.Option value="WARNING">Warning</Select.Option>
                <Select.Option value="IMPORTANT">Important</Select.Option>
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Send Notification
            </Button>
          </Form>
        </Card>

        <Card title="Recent Notifications" bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            dataSource={notifications}
            pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Title', dataIndex: 'title' },
              { title: 'Message', render: (_, row) => row.content || row.message },
              {
                title: 'Target',
                render: (_, row) => (row.receiverId ? `User #${row.receiverId}` : row.roleTarget || 'Class'),
              },
              {
                title: 'Type',
                dataIndex: 'type',
                render: (type) => (
                  <Tag color={type === 'IMPORTANT' ? 'red' : type === 'WARNING' ? 'gold' : 'blue'}>
                    {type}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </Spin>
  );
}
