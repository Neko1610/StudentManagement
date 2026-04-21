import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Table, message, Typography } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🚀 LOAD DATA
  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await api.get('/students');

      console.log("API DATA:", response.data);

      // ✅ FIX: đảm bảo luôn là array
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.content || [];

      setStudents(data);

    } catch (error) {
      console.error(error);
      message.error('Unable to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // 🚀 CREATE
  const createStudent = async (values: any) => {
    try {
      await api.post('/students?classId=1', values);
      message.success('Student created');
      setOpen(false);
      loadStudents();
    } catch (error) {
      message.error('Failed to create student');
    }
  };

  // 🚀 DELETE
  const deleteStudent = async (id: number) => {
    try {
      await api.delete(`/students/${id}`);
      message.success('Student deleted');
      loadStudents();
    } catch (error) {
      message.error('Failed to delete student');
    }
  };

  // 📊 TABLE COLUMNS
  const columns = [
    { title: 'Code', dataIndex: 'studentCode', key: 'studentCode' },
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Student) => (
        <Button danger onClick={() => deleteStudent(record.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Manage Students</Title>

      <Button
        type="primary"
        onClick={() => setOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Add Student
      </Button>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={students}
        loading={loading}
      />

      <Modal
        title="Add Student"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={createStudent}>
          <Form.Item
            name="studentCode"
            label="Student Code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>

          <Form.Item name="gender" label="Gender">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminStudents;