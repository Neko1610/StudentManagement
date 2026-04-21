import { Card, Form, Button, Input, Select, DatePicker, message, Spin } from 'antd';
import { useState } from 'react';
import { parentService } from '../../api/parentService';
import { auth } from '../../utils/auth';

export default function ParentRequests() {
  const user = auth.getUser();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmitRequest = async (values: any) => {
    try {
      setLoading(true);
      await parentService.submitRequest({
        ...values,
        parentId: user?.id,
      });
      message.success('Request submitted successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Submit Request">
        <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
          <Form.Item label="Request Type" name="type" rules={[{ required: true }]}>
            <Select placeholder="Select request type">
              <Select.Option value="LEAVE">Leave Request</Select.Option>
              <Select.Option value="TRANSFER">Transfer Request</Select.Option>
              <Select.Option value="OTHER">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Reason" name="reason" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Provide reason for request" rows={4} />
          </Form.Item>

          <Form.Item label="Start Date" name="startDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="End Date" name="endDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Submit Request
          </Button>
        </Form>
      </Card>
    </Spin>
  );
}
