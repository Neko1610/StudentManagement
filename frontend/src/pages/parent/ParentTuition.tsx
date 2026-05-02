import { Button, Card, Empty, Select, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { parentService } from '../../api/parentService';
import { auth } from '../../utils/auth';
import { Student, Tuition } from '../../types';

const { Title } = Typography;

export default function ParentTuition() {
  const user = auth.getUser();
  const [children, setChildren] = useState<Student[]>([]);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<number | undefined>();

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await parentService.getChildren(user?.email || '');
      setChildren(data || []);
      if (data?.length) {
        await loadTuition(data[0].id);
      }
    } catch {
      message.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadTuition = async (studentId: number) => {
    try {
      setLoading(true);
      setSelectedChild(studentId);
      const data = await parentService.getTuition(String(studentId));
      setTuitions(data || []);
    } catch {
      message.error('Failed to load tuition');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (record: Tuition) => {
    try {
      await parentService.payTuition(Number(record.id));
      message.success('Payment successful');
      if (selectedChild) {
        await loadTuition(selectedChild);
      }
    } catch {
      message.error('Payment failed');
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Tuition</Title>
            <div className="page-subtitle">View tuition records for your children.</div>
          </div>
        </div>

        <Card title="Tuition Fees">
          {children.length === 0 ? (
            <Empty description="No children" />
          ) : (
            <>
              <Select
                value={selectedChild}
                style={{ width: 280, marginBottom: 16 }}
                onChange={loadTuition}
                options={children.map((child) => ({
                  value: child.id,
                  label: `${child.fullName}${child.className ? ` - ${child.className}` : ''}`,
                }))}
              />

              <Table
                rowKey="id"
                dataSource={tuitions}
                locale={{ emptyText: 'No tuition records' }}
                pagination={false}
                columns={[
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    render: (value) => `${Number(value || 0).toLocaleString('vi-VN')} VND`,
                  },
                  { title: 'Description', dataIndex: 'description' },
                  {
                    title: 'Due Date',
                    dataIndex: 'dueDate',
                    render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    render: (status) => <Tag color={status === 'PAID' ? 'green' : 'red'}>{status}</Tag>,
                  },
                  {
                    title: 'Action',
                    render: (_, record) =>
                      record.status !== 'PAID' ? (
                        <Button type="primary" onClick={() => handlePay(record)}>
                          Pay
                        </Button>
                      ) : null,
                  },
                ]}
              />
            </>
          )}
        </Card>
      </div>
    </Spin>
  );
}
