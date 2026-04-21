import {
  Card, Table, Button, Upload,
  message, Space
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

  // 🔥 load student
  useEffect(() => {
    if (user?.id) {
      loadStudent();
    }
  }, [user?.id]);

  const loadStudent = async () => {
    const data = await studentService.getProfile(user!.id);
    setStudent(data);
  };

  // 🔥 load assignments
  useEffect(() => {
    if (student?.classId) {
      loadAssignments();
    }
  }, [student?.classId]);

  const loadAssignments = async () => {
    const res = await client.get(`/assignments/class/${student.classId}`);
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
      <Table dataSource={assignments} columns={columns} rowKey="id" />
    </Card>
  );
}