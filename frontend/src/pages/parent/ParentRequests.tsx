import { SendOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { requestService } from '../../api/requestService';
import { ParentRequest } from '../../types';
import './style.css';

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
    <div className="page-container">

      {/* HEADER */}
      <div className="page-heading">
        <Title level={2}>Requests</Title>
        <div className="page-subtitle">
          Send leave requests or messages to your child's homeroom teacher.
        </div>
      </div>

      <div className="grid-2">

        {/* LEFT FORM */}
        <Card className="notification-card accent-bar">
          <div className="card-header">
            <SendOutlined />
            <span>Submit Request</span>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
            <Form.Item name="requestType" label="Request Type" rules={[{ required: true }]}>
              <Select placeholder="Select request type">
                <Select.Option value="LEAVE">Leave Request</Select.Option>
                <Select.Option value="MESSAGE">Message to Teacher</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="content" label="Content" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="Write your request..." />
            </Form.Item>

            {requestType === 'LEAVE' && (
              <Form.Item name="dateRange" label="Leave Dates" rules={[{ required: true }]}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            )}

            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              className="send-btn"
              block
            >
              Submit Request
            </Button>
          </Form>
        </Card>

        {/* RIGHT TIPS */}
        <Card className="tips-clean">
          <div className="tips-header">REQUEST GUIDELINES</div>

          <div className="tip-row">
            <span className="tip-check">✔</span>
            <div>
              <span className="tip-bold">Be Clear:</span>
              <span className="tip-text"> Provide full details for faster approval.</span>
            </div>
          </div>

          <div className="tip-row">
            <span className="tip-check">✔</span>
            <div>
              <span className="tip-bold">Advance Notice:</span>
              <span className="tip-text"> Submit leave requests early.</span>
            </div>
          </div>

          <div className="tip-row">
            <span className="tip-check">✔</span>
            <div>
              <span className="tip-bold">Respect:</span>
              <span className="tip-text"> Keep communication polite and concise.</span>
            </div>
          </div>
        </Card>

      </div>

      {/* TABLE */}
      <Card title="Submitted Requests" className="table-card">
        <Table
          rowKey="id"
          dataSource={requests}
          pagination={{ pageSize: 6 }}
          columns={[
            { title: 'Type', dataIndex: 'requestType' },
            { title: 'Content', dataIndex: 'content' },
            {
              title: 'Dates',
              render: (_, row) =>
                row.startDate && row.endDate
                  ? `${row.startDate} - ${row.endDate}`
                  : '-',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status) => (
                <Tag
                  color={
                    status === 'APPROVED'
                      ? 'green'
                      : status === 'REJECTED'
                      ? 'red'
                      : 'gold'
                  }
                >
                  {status}
                </Tag>
              ),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              render: (value) =>
                value ? new Date(value).toLocaleString() : '-',
            },
          ]}
        />
      </Card>

    </div>
  </Spin>
);
}
