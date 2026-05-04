import { BellOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { notificationService } from '../../api/notificationService';
import { Notification } from '../../types';
import './style.css';
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
      <div className="page-container">

        {/* HEADER */}
        <div className="page-heading">
          <Title level={2} className="page-title">
            Class Notifications
          </Title>
          <div className="page-subtitle">
            Send updates to students or parents in your assigned classes.
          </div>
        </div>

        <div className="grid-2">

          {/* LEFT FORM */}
          <Card className="notification-card accent-bar">
            <div className="card-header">
              <BellOutlined />
              <span>Send Class Notification</span>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendNotification}
              initialValues={{ type: 'INFO' }}
            >
              <Form.Item
                label="Recipients"
                name="recipientType"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="STUDENT">
                    Students in my classes
                  </Select.Option>
                  <Select.Option value="PARENT">
                    Parents of my classes
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input placeholder="Notification title" />
              </Form.Item>

              <Form.Item name="message" label="Message" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="Write message..." />
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

          {/* RIGHT - TIPS */}
          <Card className="tips-clean">
            <div className="tips-header">COMMUNICATION TIPS</div>

            <div className="tip-row">
              <span className="tip-check">✔</span>
              <div>
                <span className="tip-bold">Be Concise:</span>
                <span className="tip-text">
                  {' '}Keep messages short for better readability.
                </span>
              </div>
            </div>

            <div className="tip-row">
              <span className="tip-check">✔</span>
              <div>
                <span className="tip-bold">Timing Matters:</span>
                <span className="tip-text">
                  {' '}Send before 8PM for best reach.
                </span>
              </div>
            </div>

            <div className="tip-row">
              <span className="tip-check">✔</span>
              <div>
                <span className="tip-bold">Privacy:</span>
                <span className="tip-text">
                  {' '}Avoid sensitive personal info.
                </span>
              </div>
            </div>
          </Card>

        </div>

        {/* TABLE */}
        <Card title="Recent Notifications" className="table-card">
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
                    : row.roleTarget || 'Class',
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
    </Spin>
  );
}
