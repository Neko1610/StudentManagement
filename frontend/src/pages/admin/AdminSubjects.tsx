import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

export default function AdminSubjects() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    const res = await adminService.getSubjects();
    setData(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await adminService.updateSubject(editing.id, values);
        message.success('Updated');
      } else {
        await adminService.createSubject(values);
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
    await adminService.deleteSubject(id);
    message.success('Deleted');
    loadData();
  };

  const columns = [
    { title: 'Subject Name', dataIndex: 'name' },
    {
      title: 'Action',
      render: (_: any, record: any) => (
        <Space>
          <Button
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
    <>
      <Button
        type="primary"
        onClick={() => {
          setEditing(null);
          form.resetFields();
          setOpen(true);
        }}
        style={{ marginBottom: 10 }}
      >
        + Add Subject
      </Button>

      <Table rowKey="id" dataSource={data} columns={columns} />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={editing ? 'Edit Subject' : 'Add Subject'}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Subject Name" required>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}