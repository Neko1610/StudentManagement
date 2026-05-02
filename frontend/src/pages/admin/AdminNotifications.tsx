import { BellOutlined, SendOutlined } from '@ant-design/icons';
import { Card, Form, Button, Input, Select, message, Spin, Table, Tag, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { notificationService } from '../../api/notificationService';
import { Notification } from '../../types';

const { Title } = Typography;

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form] = Form.useForm();
  const recipientType = Form.useWatch('recipientType', form);

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
      await adminService.sendNotification(values);
      message.success('Notification sent');
      form.resetFields();
      await loadNotifications();
    } catch (error) {
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
            <Title level={2} className="page-title">Notifications</Title>
            <div className="page-subtitle">Send school-wide announcements or targeted updates.</div>
          </div>
        </div>

        <Card title={<Space><BellOutlined /> Send Notification</Space>}>
          <Form form={form} layout="vertical" onFinish={handleSendNotification} initialValues={{ type: 'INFO' }}>
          <Form.Item label="Recipient Type" name="recipientType" rules={[{ required: true, message: 'Select recipient type' }]}>
            <Select placeholder="Select recipient type">
              <Select.Option value="ALL">All Users</Select.Option>
              <Select.Option value="STUDENT">All Students</Select.Option>
              <Select.Option value="TEACHER">All Teachers</Select.Option>
              <Select.Option value="PARENT">All Parents</Select.Option>
              <Select.Option value="SPECIFIC">Specific User</Select.Option>
            </Select>
          </Form.Item>

          {recipientType === 'SPECIFIC' && (
            <Form.Item label="User ID" name="userId" rules={[{ required: true, message: 'Enter user ID' }]}>
              <Input type="number" placeholder="Enter the target user ID" />
            </Form.Item>
          )}

          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Enter a title' }]}>
            <Input placeholder="Notification title" />
          </Form.Item>

          <Form.Item label="Message" name="message" rules={[{ required: true, message: 'Enter a message' }]}>
            <Input.TextArea placeholder="Notification message" rows={4} />
          </Form.Item>

          <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Select type' }]}>
            <Select placeholder="Select notification type">
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
              { title: 'Target', render: (_, row) => row.receiverId ? `User #${row.receiverId}` : row.roleTarget || 'Specific' },
              { title: 'Type', dataIndex: 'type', render: (type) => <Tag color={type === 'IMPORTANT' ? 'red' : type === 'WARNING' ? 'gold' : 'blue'}>{type}</Tag> },
            ]}
          />
        </Card>
      </div>
    </Spin>
  );
}
