import {
  Card,
  List,
  Table,
  Empty,
  Spin,
  Tabs,
  message,
  Button,
} from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { parentService } from '../../api/parentService';
import { auth } from '../../utils/auth';
import { Tuition, Fund, Student } from '../../types';

export default function ParentTuition() {
  const user = auth.getUser();

  const [children, setChildren] = useState<Student[]>([]);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      loadTuition(String(children[0].id)); // ✅ FIX
    }
  }, [children]);

  // ================= LOAD CHILD =================
  const loadChildren = async () => {
    try {
      const data = await parentService.getChildren(user?.email || '');
      setChildren(data);
    } catch {
      message.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD TUITION =================
  const loadTuition = async (studentId: string) => {
    try {
      setLoading(true);
      setSelectedChild(studentId);

      const student = children.find(c => c.id === Number(studentId))

      const classId =
        student?.classId ||
        (student as any)?.studentClass?.id;

      const [tuitionData, fundData] = await Promise.all([
        parentService.getTuition(studentId),
        classId ? parentService.getFunds(String(classId)) : Promise.resolve([]),
      ]);

      // 🔥 DEFAULT 900K
      if (!tuitionData || tuitionData.length === 0) {
        setTuitions([
          {
            id: 'default',
            studentId: studentId,
            amount: 900000,
            dueDate: new Date().toISOString(),
            status: 'PENDING',
          },
        ]);
      } else {
        setTuitions(tuitionData);
      }

      setFunds(fundData || []);
      setTotal(0); // reset
    } catch {
      message.error('Failed to load tuition');
    } finally {
      setLoading(false);
    }
  };

  // ================= PAY =================
  const handlePay = async (record: Tuition) => {
    try {
      const id = Number(record.id);

      // ❌ nếu là default → không gọi API
      if (isNaN(id)) {
        message.warning('Demo data - cannot pay');
        return;
      }

      await parentService.payTuition(id);

      message.success('Payment successful');

      loadTuition(selectedChild);
    } catch {
      message.error('Payment failed');
    }
  };

  // ================= CALCULATE =================
  const handleCalculate = () => {
    const sum = tuitions
      .filter(t => t.status !== 'PAID')
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    setTotal(sum);
  };

  // ================= TABLE =================
  const tuitionColumns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (val: number) =>
        (val || 900000).toLocaleString('vi-VN') + ' VNĐ',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      render: (d: string) =>
        d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <span
          style={{
            color: s === 'PAID' ? 'green' : 'red',
            fontWeight: 500,
          }}
        >
          {s}
        </span>
      ),
    },
    {
      title: 'Action',
      render: (_: any, record: Tuition) =>
        record.status !== 'PAID' && (
          <Button type="primary" onClick={() => handlePay(record)}>
            Pay
          </Button>
        ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Tabs
        items={[
          {
            key: 'tuition',
            label: 'Tuition Fees',
            children: (
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  background: '#f0faff',
                }}
              >
                {/* SELECT */}
                <div style={{ marginBottom: 16 }}>
                  <label>Select Child: </label>
                  <select
                    value={selectedChild}
                    onChange={(e) => loadTuition(e.target.value)}
                    style={{
                      marginLeft: 8,
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid #1890ff',
                      background: '#e6f7ff',
                      fontWeight: 500,
                    }}
                  >
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TABLE */}
                {tuitions.length === 0 ? (
                  <Empty description="No tuition records" />
                ) : (
                  <>
                    <Table
                      dataSource={tuitions}
                      columns={tuitionColumns}
                      rowKey="id"
                      pagination={false}
                    />

                    {/* BUTTON */}
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <Button type="primary" onClick={handleCalculate}>
                        Tính tiền
                      </Button>
                    </div>

                    {/* TOTAL */}
                    {total > 0 && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: '#1890ff',
                          textAlign: 'right',
                        }}
                      >
                        Tổng tiền: {total.toLocaleString('vi-VN')} VNĐ
                      </div>
                    )}
                  </>
                )}
              </Card>
            ),
          },

 
        ]}
      />
    </Spin>
  );
}