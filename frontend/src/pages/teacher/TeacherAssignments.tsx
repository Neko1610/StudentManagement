import {
  Card, Table, Button, Modal,
  Form, Input, DatePicker,
  message, Select, Upload, Space, Popconfirm
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';
import dayjs from 'dayjs';

export default function TeacherAssignments() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>();
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [file, setFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  // 🔥 LOAD CLASSES
  useEffect(() => {
    if (user?.email) {
      loadClasses();
    }
  }, [user?.email]);

  const loadClasses = async () => {
    if (!user?.email) return;

    const data = await teacherService.getClasses(user.email);
    setClasses(data);
  };

  // 🔥 LOAD ASSIGNMENTS
  const loadAssignments = async (classId: number) => {
    setSelectedClass(classId);
    setLoading(true);

    const data = await teacherService.getAssignmentsByClass(classId);
    setAssignments(data);

    setLoading(false);
  };

  // 🔥 CREATE / UPDATE
  const handleSubmit = async () => {
    try {
      if (!user) {
        message.error("User not found");
        return;
      }

      const values = await form.validateFields();

      // 🔥 CREATE
      if (!editing) {
        if (!file) {
          message.warning("Chọn file");
          return;
        }

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description || "");
        formData.append("deadline", values.deadline.format("YYYY-MM-DD"));
        formData.append("classId", selectedClass!.toString());
        formData.append("email", user.email); // ✅ FIX CHUẨN
        formData.append("file", file);

        await teacherService.createAssignment(formData);
        message.success("Created");
      }

      // 🔥 UPDATE (JSON - KHÔNG dùng file)
      else {
        await teacherService.updateAssignment(editing.id, {
          title: values.title,
          description: values.description,
          deadline: values.deadline.format("YYYY-MM-DD")
        });

        message.success("Updated");
      }

      setModalOpen(false);
      setEditing(null);
      setFile(null);
      form.resetFields();

      if (selectedClass) loadAssignments(selectedClass);

    } catch (err) {
      message.error("Error");
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id: number) => {
    await teacherService.deleteAssignment(id);
    message.success("Deleted");

    if (selectedClass) loadAssignments(selectedClass);
  };

  // 🔥 OPEN EDIT
  const openEdit = (record: any) => {
    setEditing(record);
    setModalOpen(true);

    form.setFieldsValue({
      title: record.title,
      description: record.description,
      deadline: record.deadline ? dayjs(record.deadline) : null
    });
  };

  const columns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Deadline', dataIndex: 'deadline' },
    {
      title: 'Download',
      render: (_: any, r: any) => (
        <a href={`http://localhost:8080/assignments/download/${r.filePath}`}>
          Download
        </a>
      )
    },
    {
      title: 'Action',
      render: (_: any, r: any) => (
        <Space>
          <Button onClick={() => openEdit(r)}>Edit</Button>

          <Popconfirm
            title="Delete this assignment?"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card title="Assignments">

      {/* 🔥 SELECT CLASS */}
      <Select
        placeholder="Select class"
        style={{ width: 200 }}
        onChange={loadAssignments}
      >
        {classes.map(c => (
          <Select.Option key={c.id} value={c.id}>
            {c.name}
          </Select.Option>
        ))}
      </Select>

      <Button
        type="primary"
        style={{ marginLeft: 10 }}
        disabled={!selectedClass}
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      >
        Add Assignment
      </Button>

      {/* 🔥 TABLE */}
      <Table
        dataSource={assignments}
        columns={columns}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 20 }}
      />

      {/* 🔥 MODAL */}
      <Modal
        title={editing ? "Edit Assignment" : "Create Assignment"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {!editing && (
            <Form.Item label="File">
              <Upload
                beforeUpload={(f) => {
                  setFile(f);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload file</Button>
              </Upload>
            </Form.Item>
          )}

        </Form>
      </Modal>

    </Card>
  );
}