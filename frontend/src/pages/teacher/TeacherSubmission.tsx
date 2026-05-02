import {
  Card, Table, InputNumber, Input,
  Button, message, Select, Spin
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';
import type { Assignment, Clazz, ScoreType, Submission } from '../../types';

const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  ORAL: 'Miệng',
  TEST15: '15p',
  MID: 'Giữa kỳ',
  FINAL: 'Cuối kỳ'
};

export default function TeacherSubmissions() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<Clazz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
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
    if (!user?.email) return;

    const res = await teacherService.getAssignmentsByClass(
      classId,
      user.email // 🔥 QUAN TRỌNG
    );

    setAssignments(res);
    setSubmissions([]);
    setSelectedAssignment(null);
  };

  const loadSubmissions = async (assignmentId: number) => {
    setLoading(true);
    setSelectedAssignment(assignments.find(a => a.id === assignmentId) || null);
    const res = await teacherService.getSubmissionsByAssignment(assignmentId);
    setSubmissions(res);
    setLoading(false);
  };

  const updateLocal = <K extends keyof Submission>(
    id: number,
    field: K,
    value: Submission[K]
  ) => {
    setSubmissions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleGrade = async (record: Submission) => {
    const updated = await teacherService.updateSubmission(
      record.id,
      {
        score: record.score,
        comment: record.comment
      }
    );

    setSubmissions(prev =>
      prev.map(item => item.id === updated.id ? updated : item)
    );

    message.success("Saved");
  };
  const columns = [
    {
      title: 'Student',
      render: (_: unknown, r: Submission) => r.student?.fullName
    },
    {
      title: 'Type',
      render: () => selectedAssignment?.type
        ? SCORE_TYPE_LABELS[selectedAssignment.type]
        : '-'
    },
    {
      title: 'Học kì',
      render: () => selectedAssignment?.semester === 2 ? 'Học kì 2' : 'Học kì 1'
    },
    {
      title: 'File',
      render: (_: unknown, r: Submission) => (
        <a href={`http://localhost:8080/submissions/download/${r.filePath}`}>
          Download
        </a>
      )
    },
    {
      title: 'Score',
      render: (_: unknown, r: Submission) => (
        <InputNumber
          min={0}
          max={10}
          step={0.25}
          precision={2}
          value={r.score}
          onChange={(v) => updateLocal(r.id, 'score', v)}
        />
      )
    },
    {
      title: 'Comment',
      render: (_: unknown, r: Submission) => (
        <Input
          value={r.comment}
          onChange={(e) => updateLocal(r.id, 'comment', e.target.value)}
        />
      )
    },
    {
      title: 'Action',
      render: (_: unknown, r: Submission) => (
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
            {a.title} - {SCORE_TYPE_LABELS[a.type] || '-'} - {a.semester ? `HK${a.semester}` : 'Không có HK'}
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
