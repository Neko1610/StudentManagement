import { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Table, message, Typography } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

interface ParentData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  job: string;
}

const AdminParents = () => {
  const [parents, setParents] = useState<ParentData[]>([]);
  const [open, setOpen] = useState(false);

  const loadParents = async () => {
    try {
      const response = await api.get('/parents');
      setParents(response.data);
    } catch (error) {
      message.error('Unable to load parents');
    }
  };

  useEffect(() => {
    loadParents();
  }, []);

  const createParent = async (values: any) => {
    try {
      await api.post('/parents', values);
      message.success('Parent created');
      setOpen(false);
      loadParents();
    } catch (error) {
      message.error('Failed to create parent');
    }
  };

  const deleteParent = async (id: number) => {
    try {
      await api.delete(`/parents/${id}`);
      message.success('Parent deleted');
      loadParents();
    } catch (error) {
      message.error('Failed to delete parent');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Job', dataIndex: 'job', key: 'job' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ParentData) => (
        <Button danger onClick={() => deleteParent(record.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Manage Parents</Title>
      <Button type="primary" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Add Parent
      </Button>
      <Table rowKey="id" columns={columns} dataSource={parents} />
      <Modal title="Add Parent" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={createParent}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email"> <Input /> </Form.Item>
          <Form.Item name="phone" label="Phone"> <Input /> </Form.Item>
          <Form.Item name="job" label="Job"> <Input /> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminParents;
