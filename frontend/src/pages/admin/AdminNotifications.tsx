import { Card, Form, Button, Input, Select, message, Spin } from 'antd';
import { useState } from 'react';
import { adminService } from '../../api/adminService';

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSendNotification = async (values: any) => {
    try {
      setLoading(true);
      await adminService.sendNotification(values);
      message.success('Notification sent');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Send Notification">
        <Form form={form} layout="vertical" onFinish={handleSendNotification}>
          <Form.Item label="Recipient Type" name="recipientType" rules={[{ required: true }]}>
            <Select placeholder="Select recipient type">
              <Select.Option value="ALL">All Users</Select.Option>
              <Select.Option value="STUDENTS">All Students</Select.Option>
              <Select.Option value="TEACHERS">All Teachers</Select.Option>
              <Select.Option value="PARENTS">All Parents</Select.Option>
              <Select.Option value="SPECIFIC">Specific User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Recipient ID" name="recipientId">
            <Input placeholder="Leave empty if sending to all" />
          </Form.Item>

          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="Notification title" />
          </Form.Item>

          <Form.Item label="Message" name="message" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Notification message" rows={4} />
          </Form.Item>

          <Form.Item label="Type" name="type">
            <Select placeholder="Select notification type">
              <Select.Option value="INFO">Info</Select.Option>
              <Select.Option value="WARNING">Warning</Select.Option>
              <Select.Option value="ALERT">Alert</Select.Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Send Notification
          </Button>
        </Form>
      </Card>
    </Spin>
  );
}
