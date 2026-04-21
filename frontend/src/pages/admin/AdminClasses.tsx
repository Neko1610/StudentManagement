import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Card,
} from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

export default function AdminClasses() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    const res = await adminService.getClasses();
    setData(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await adminService.updateClass(editing.id, values);
        message.success('Updated');
      } else {
        await adminService.createClass(values);
        message.success('Created');
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData();
    } catch {
      message.error('Error');
    }
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteClass(id);
    message.success('Deleted');
    loadData();
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Grade', dataIndex: 'grade' },
    { title: 'Room', dataIndex: 'room' },
    {
      title: 'Actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setOpen(true);
            }}
          >
            Edit
          </Button>

          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Classes"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          + Add Class
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={editing ? 'Edit Class' : 'Add Class'}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Class Name" required>
            <Input />
          </Form.Item>

          <Form.Item name="grade" label="Grade" required>
            <Input />
          </Form.Item>
          <Form.Item
            name="room"
            label="Room"
            rules={[{ required: true, message: 'Please enter room' }]}
          >
            <Input placeholder="VD: 101" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}