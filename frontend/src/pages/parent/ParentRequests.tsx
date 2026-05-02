import { SendOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { requestService } from '../../api/requestService';
import { ParentRequest } from '../../types';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function ParentRequests() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [form] = Form.useForm();
  const requestType = Form.useWatch('requestType', form);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await requestService.getMine();
    setRequests(data || []);
  };

  const handleSubmitRequest = async (values: any) => {
    const [startDate, endDate] = values.dateRange || [];

    try {
      setLoading(true);
      await requestService.submit({
        requestType: values.requestType,
        content: values.content,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
      });
      message.success('Request submitted successfully');
      form.resetFields();
      await loadRequests();
    } catch (error) {
      console.error(error);
      message.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Requests</Title>
            <div className="page-subtitle">Send leave requests or messages to your child's homeroom teacher.</div>
          </div>
        </div>

        <Card title="Submit Request">
          <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
            <Form.Item label="Request Type" name="requestType" rules={[{ required: true, message: 'Select request type' }]}>
              <Select placeholder="Select request type">
                <Select.Option value="LEAVE">Leave Request</Select.Option>
                <Select.Option value="MESSAGE">Message to Homeroom Teacher</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Content" name="content" rules={[{ required: true, message: 'Enter request content' }]}>
              <Input.TextArea placeholder="Write your request" rows={4} />
            </Form.Item>

            {requestType === 'LEAVE' && (
              <Form.Item label="Leave Dates" name="dateRange" rules={[{ required: true, message: 'Select leave dates' }]}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            )}

            <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
              Submit Request
            </Button>
          </Form>
        </Card>

        <Card title="Submitted Requests" bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            dataSource={requests}
            pagination={{ pageSize: 6 }}
            columns={[
              { title: 'Type', dataIndex: 'requestType' },
              { title: 'Content', dataIndex: 'content' },
              {
                title: 'Dates',
                render: (_, row) => row.startDate && row.endDate ? `${row.startDate} - ${row.endDate}` : '-',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (status) => (
                  <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'gold'}>
                    {status}
                  </Tag>
                ),
              },
              {
                title: 'Created',
                dataIndex: 'createdAt',
                render: (value) => value ? new Date(value).toLocaleString() : '-',
              },
            ]}
          />
        </Card>
      </div>
    </Spin>
  );
}
