import {
  Card, Table, InputNumber, Input,
  Button, message, Select, Spin
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';

export default function TeacherSubmissions() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const loadAssignments = async (classId: number) => {
    const res = await teacherService.getAssignmentsByClass(classId);
    setAssignments(res);
  };

  const loadSubmissions = async (assignmentId: number) => {
    setLoading(true);
    const res = await teacherService.getSubmissionsByAssignment(assignmentId);
    setSubmissions(res);
    setLoading(false);
  };

  const updateLocal = (id: number, field: string, value: any) => {
    setSubmissions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleGrade = async (record: any) => {
    await teacherService.updateSubmission(record.id, {
      score: record.score,
      comment: record.comment
    });

    message.success("Saved");
  };

  const columns = [
    {
      title: 'Student',
      render: (_: any, r: any) => r.student?.fullName
    },
    {
      title: 'File',
      render: (_: any, r: any) => (
        <a href={`http://localhost:8080/submissions/download/${r.filePath}`}>
          Download
        </a>
      )
    },
    {
      title: 'Score',
      render: (_: any, r: any) => (
        <InputNumber
          value={r.score}
          onChange={(v) => updateLocal(r.id, 'score', v)}
        />
      )
    },
    {
      title: 'Comment',
      render: (_: any, r: any) => (
        <Input
          value={r.comment}
          onChange={(e) => updateLocal(r.id, 'comment', e.target.value)}
        />
      )
    },
    {
      title: 'Action',
      render: (_: any, r: any) => (
        <Button onClick={() => handleGrade(r)}>
          Save
        </Button>
      )
    }
  ];

  return (
    <Card title="Submissions">

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

      <Select
        placeholder="Select assignment"
        style={{ width: 200, marginLeft: 10 }}
        onChange={loadSubmissions}
      >
        {assignments.map(a => (
          <Select.Option key={a.id} value={a.id}>
            {a.title}
          </Select.Option>
        ))}
      </Select>

      <Spin spinning={loading}>
        <Table
          dataSource={submissions}
          columns={columns}
          rowKey="id"
          style={{ marginTop: 20 }}
        />
      </Spin>

    </Card>
  );
}