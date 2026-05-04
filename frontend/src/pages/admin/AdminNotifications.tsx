import { BellOutlined, SendOutlined } from '@ant-design/icons';
import { Card, Form, Button, Input, Select, message, Spin, Table, Tag, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { notificationService } from '../../api/notificationService';
import { Notification } from '../../types';
import './style.css';
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
      <div style={{ padding: '32px 48px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 4 }}>
            Notifications
          </Title>
          <div style={{ color: '#888' }}>
            Send school-wide announcements or targeted updates.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

          {/* LEFT - FORM */}
          <Card
            className="notification-card accent-bar"
            style={{ borderRadius: 16 }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <BellOutlined style={{ fontSize: 20, color: '#6c5ce7' }} />
              <span style={{ marginLeft: 8, fontWeight: 600 }}>
                Compose Notification
              </span>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendNotification}
              initialValues={{ type: 'INFO' }}
            >
              <Form.Item
                label="Recipient Type"
                name="recipientType"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select recipient type">
                  <Select.Option value="ALL">All Users</Select.Option>
                  <Select.Option value="STUDENT">Students</Select.Option>
                  <Select.Option value="TEACHER">Teachers</Select.Option>
                  <Select.Option value="PARENT">Parents</Select.Option>
                  <Select.Option value="SPECIFIC">Specific User</Select.Option>
                </Select>
              </Form.Item>

              {recipientType === 'SPECIFIC' && (
                <Form.Item
                  label="User ID"
                  name="userId"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter user ID" />
                </Form.Item>
              )}

              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input placeholder="Notification title" />
              </Form.Item>

              <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="Write your message..." />
              </Form.Item>

              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="INFO">Info</Select.Option>
                  <Select.Option value="WARNING">Warning</Select.Option>
                  <Select.Option value="IMPORTANT">Important</Select.Option>
                </Select>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                className="send-btn"
                block
              >
                Send Notification
              </Button>
            </Form>
          </Card>

          {/* RIGHT - STATS / PREVIEW */}
          <Card className="tips-clean">
            <div className="tips-header">COMMUNICATION TIPS</div>

            <div className="tip-row">
              <span className="tip-check">✔</span>
              <div>
                <span className="tip-bold">Be Concise:</span>
                <span className="tip-text"> Mobile notifications truncate after 110 characters.</span>
              </div>
            </div>

            <div className="tip-row">
              <span className="tip-check">✔</span>
              <div>
                <span className="tip-bold">Timing Matters:</span>
                <span className="tip-text"> Send evening alerts before 8:00 PM for maximum reach.</span>
              </div>
            </div>

            <div className="tip-row">
              <span className="tip-check">✔</span>
              <div>
                <span className="tip-bold">Privacy:</span>
                <span className="tip-text"> Use recipient groups to keep individual data secure.</span>
              </div>
            </div>
          </Card>
          {/* TABLE */}
          <Card
            title="Recent Notifications"
            style={{ marginTop: 32, borderRadius: 16 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              rowKey="id"
              dataSource={notifications}
              pagination={{ pageSize: 6 }}
              columns={[
                { title: 'Title', dataIndex: 'title' },
                { title: 'Message', render: (_, row) => row.content || row.message },
                {
                  title: 'Target',
                  render: (_, row) =>
                    row.receiverId
                      ? `User #${row.receiverId}`
                      : row.roleTarget || 'All',
                },
                {
                  title: 'Type',
                  dataIndex: 'type',
                  render: (type) => (
                    <Tag
                      color={
                        type === 'IMPORTANT'
                          ? 'red'
                          : type === 'WARNING'
                            ? 'gold'
                            : 'blue'
                      }
                    >
                      {type}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </Spin>
  );
}