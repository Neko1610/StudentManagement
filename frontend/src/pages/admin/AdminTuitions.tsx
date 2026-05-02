import { DollarOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Student, Tuition } from '../../types';

const { Title } = Typography;

export default function AdminTuitions() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentData, tuitionData] = await Promise.all([
        adminService.getStudents(),
        adminService.getTuitions(),
      ]);
      setStudents(studentData || []);
      setTuitions(tuitionData || []);
    } catch (error) {
      message.error('Failed to load tuition data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      setLoading(true);
      await adminService.createTuition({
        studentId: values.studentId,
        amount: values.amount,
        description: values.description,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      });
      message.success('Tuition created');
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Failed to create tuition');
    } finally {
      setLoading(false);
    }
  };

  const studentName = (studentId: string | number) =>
    students.find((student) => String(student.id) === String(studentId))?.fullName || `Student #${studentId}`;

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Tuition</Title>
            <div className="page-subtitle">Create tuition records for students and track payment status.</div>
          </div>
        </div>

        <Card title={<Space><DollarOutlined /> Create Tuition</Space>}>
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item label="Student" name="studentId" rules={[{ required: true, message: 'Select a student' }]}>
              <Select showSearch placeholder="Select student" optionFilterProp="label">
                {students.map((student) => (
                  <Select.Option key={student.id} value={student.id} label={`${student.fullName} ${student.studentCode || ''}`}>
                    {student.fullName} {student.className ? `- ${student.className}` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Enter amount' }]}>
              <InputNumber min={0} style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={3} placeholder="Tuition description" />
            </Form.Item>

            <Form.Item label="Due Date" name="dueDate" rules={[{ required: true, message: 'Select due date' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Create Tuition
            </Button>
          </Form>
        </Card>

        <Card title="Tuition Records" bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            dataSource={tuitions}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: 'Student', render: (_, row) => studentName(row.studentId || (row as any).student?.id) },
              { title: 'Amount', dataIndex: 'amount', render: (value) => `${Number(value || 0).toLocaleString('vi-VN')} VND` },
              { title: 'Description', dataIndex: 'description' },
              { title: 'Due Date', dataIndex: 'dueDate', render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (status) => <Tag color={status === 'PAID' ? 'green' : 'red'}>{status}</Tag>,
              },
            ]}
          />
        </Card>
      </div>
    </Spin>
  );
}
