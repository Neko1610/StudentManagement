import {
  Card, Table, Button, Upload,
  message, Space, Select
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { auth } from '../../utils/auth';
import client from '../../api/client';
import { studentService } from '../../api/studentService';

export default function StudentAssignments() {
  const user = auth.getUser();

  const [student, setStudent] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [fileMap, setFileMap] = useState<{ [key: number]: File }>({});
  const [semester, setSemester] = useState(1);
  // 🔥 load student
  useEffect(() => {
    if (user) {
      loadStudent();
    }
  }, [user]);

  const loadStudent = async () => {
    try {
      const email = (user as any)?.email || (user as any)?.username;

      if (!email) {
        message.error("Không tìm thấy email user");
        return;
      }

      const data = await studentService.getProfile(email);

      setStudent(data);

    } catch (err) {
      console.error(err);
      message.error("Load student thất bại");
    }
  };

  // 🔥 load assignments
  useEffect(() => {
    if (student?.classId) {
      loadAssignments();
    }
  }, [student?.classId, semester]);

  const loadAssignments = async () => {
    const res = await client.get(
      `/assignments/student/class/${student.classId}`,
      {
        params: { semester }
      }
    );
    setAssignments(res.data);
  };
  const handleUpload = async (file: File, assignmentId: number) => {
    if (!student?.id) {
      message.error("Student not found");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("studentId", String(student.id));
      formData.append("assignmentId", String(assignmentId));

      await studentService.submitAssignment(formData);

      message.success("Upload success");

    } catch (err) {
      console.error(err);
      message.error("Upload failed");
    }
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
      title: 'Upload',
      render: (_: any, r: any) => (
        <Space>
          <Upload
            beforeUpload={(file) => {
              setFileMap(prev => ({ ...prev, [r.id]: file }));
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>

          <Button
            type="primary"
            disabled={!fileMap[r.id]}
            onClick={() => handleUpload(fileMap[r.id], r.id)}
          >
            Nộp
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title="My Assignments">

      {/* 🔥 THÊM Ở ĐÂY */}
      <div style={{ marginBottom: 16 }}>
        <Select
          value={semester}
          onChange={setSemester}
          style={{ width: 120 }}
        >
          <Select.Option value={1}>HK1</Select.Option>
          <Select.Option value={2}>HK2</Select.Option>
        </Select>
      </div>

      <Table
        dataSource={assignments}
        columns={columns}
        rowKey="id"
      />
    </Card>
  );
}