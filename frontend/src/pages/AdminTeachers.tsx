import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Table, message, Typography } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  degree: string;
}

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);

  const loadTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      message.error('Unable to load teachers');
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const createTeacher = async (values: any) => {
    try {
      await api.post('/teachers', values);
      message.success('Teacher created');
      setOpen(false);
      loadTeachers();
    } catch (error) {
      message.error('Failed to create teacher');
    }
  };

  const deleteTeacher = async (id: number) => {
    try {
      await api.delete(`/teachers/${id}`);
      message.success('Teacher deleted');
      loadTeachers();
    } catch (error) {
      message.error('Failed to delete teacher');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Degree', dataIndex: 'degree', key: 'degree' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Teacher) => (
        <Button danger onClick={() => deleteTeacher(record.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Manage Teachers</Title>
      <Button type="primary" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Add Teacher
      </Button>
      <Table rowKey="id" columns={columns} dataSource={teachers} />
      <Modal title="Add Teacher" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={createTeacher}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email"> <Input /> </Form.Item>
          <Form.Item name="degree" label="Degree"> <Input /> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTeachers;
