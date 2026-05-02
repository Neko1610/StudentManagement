import { Button, Card, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { requestService } from '../../api/requestService';
import { ParentRequest } from '../../types';

const { Title } = Typography;

export default function TeacherRequests() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<ParentRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getForTeacher();
      setRequests(data || []);
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (id: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      if (action === 'approve') {
        await requestService.approve(id);
        message.success('Request approved');
      } else {
        await requestService.reject(id);
        message.success('Request rejected');
      }
      await loadRequests();
    } catch {
      message.error('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Parent Requests</Title>
            <div className="page-subtitle">Requests from parents whose children are in your homeroom class.</div>
          </div>
        </div>

        <Card title="Incoming Requests" bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            dataSource={requests}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: 'Parent', render: (_, row) => row.parentName || `Parent #${row.parentId}` },
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
              {
                title: 'Action',
                render: (_, row) =>
                  row.status === 'PENDING' ? (
                    <Space>
                      <Button type="primary" onClick={() => updateRequest(row.id, 'approve')}>
                        Approve
                      </Button>
                      <Button danger onClick={() => updateRequest(row.id, 'reject')}>
                        Reject
                      </Button>
                    </Space>
                  ) : null,
              },
            ]}
          />
        </Card>
      </div>
    </Spin>
  );
}
