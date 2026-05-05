import {
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';

const scoreAlreadyExistsMessage = 'Score already exists';

const getErrorMessage = (error: any) => {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  return data?.message || data?.error || error?.message || 'Unknown error';
};

const toScoreValue = (value: unknown) =>
  value === undefined || value === null || value === '' ? null : Number(value);

export default function TeacherScores() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>(null);

  const [selectedClassId, setSelectedClassId] = useState<number>();
  const [semester, setSemester] = useState<number>(1);

  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [loadingExport, setLoadingExport] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [form] = Form.useForm();

  const user = auth.getUser();

  useEffect(() => {
    if (!user?.email) return;

    const load = async () => {
      const teacherRes = await teacherService.getProfile(user.email);
      setTeacher(teacherRes);

      const classRes = await teacherService.getClasses(user.email);
      setClasses(classRes);
    };

    load();
  }, [user?.email]);

  const fetchStudents = async (classId: number) => {
    setSelectedClassId(classId);

    if (!user?.email) return;

    const studentsRes = await teacherService.getStudentsByClass(classId);
    const scoresRes = await teacherService.getScoresByClass(classId, user.email);

    const merged = studentsRes.map((student: any) => ({
      ...student,
      scores: scoresRes.filter((score: any) => Number(score.studentId) === Number(student.id)),
    }));

    setStudents(merged);
  };

  const teacherSubjectId = Number(teacher?.subject?.id ?? teacher?.subjectId);
  const teacherSubjectName = teacher?.subject?.name ?? teacher?.subjectName;

  const getScore = (student: any, targetSemester = semester) =>
    student.scores?.find(
      (score: any) =>
        Number(score.studentId) === Number(student.id) &&
        Number(score.semester) === Number(targetSemester) &&
        (
          Number(score.subjectId) === teacherSubjectId ||
          score.subjectName === teacherSubjectName
        )
    );

  const handleExport = async () => {
    if (!selectedClassId) {
      message.error('Select a class first');
      return;
    }

    setLoadingExport(true);

    try {
      let blob;
      let fileName;
      if (!user?.email) {
        message.error("Không có email user");
        return;
      }

      blob = await teacherService.exportTeacherExcel(
        selectedClassId,
        semester,
        user.email
      );
      if (exportType === 'excel') {
        blob = await teacherService.exportTeacherExcel(
          selectedClassId,
          semester,
          user.email // 👈 BẮT BUỘC
        );

        fileName = `BangDiem_Lop${selectedClassId}_HK${semester}.xlsx`;
      } else {
        blob = await teacherService.exportScorePDF(selectedClassId, semester);
        fileName = `BangDiem_Lop${selectedClassId}_HK${semester}.pdf`;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      message.error('Export failed');
    } finally {
      setLoadingExport(false);
    }
  };

  const openAdd = (student: any) => {
    form.resetFields();
    setSelectedStudent(student);
    setOpen(true);

    const score = getScore(student);
    form.setFieldsValue({
      semester,
      oral: semester === 1 ? score?.oral1 : score?.oral2,
      test15: semester === 1 ? score?.test15_1 : score?.test15_2,
      mid: semester === 1 ? score?.mid1 : score?.mid2,
      final: semester === 1 ? score?.final1 : score?.final2,
    });
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (!selectedStudent?.id || !teacherSubjectId || !selectedClassId || !user?.email) {
      message.error('Missing student, subject, or class data');
      return;
    }

    const data = {
      studentId: Number(selectedStudent.id),
      subjectId: teacherSubjectId,
      semester: Number(values.semester),
      oral: toScoreValue(values.oral),
      test15: toScoreValue(values.test15),
      mid: toScoreValue(values.mid),
      final: toScoreValue(values.final),
    };

    try {
      console.log('Submitting score payload', data);
      await teacherService.createScore(data);
      message.success('Score created');
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      if (!errorMessage.includes(scoreAlreadyExistsMessage)) {
        console.error('Save score failed', err);
        message.error(errorMessage || 'Failed to save score');
        return;
      }

      try {
        const latestScores = await teacherService.getScoresByClass(selectedClassId, user.email);
        const existing = latestScores.find(
          (score: any) =>
            Number(score.studentId) === data.studentId &&
            Number(score.semester) === data.semester &&
            (
              Number(score.subjectId) === data.subjectId ||
              score.subjectName === teacherSubjectName
            )
        );

        if (!existing?.id) {
          throw new Error('Backend reported an existing score, but refresh did not return its id');
        }

        console.log('Updating existing score payload', { id: existing.id, ...data });
        await teacherService.updateScore(existing.id, data, data.semester);
        message.success('Score updated');
      } catch (updateErr) {
        console.error('Update score fallback failed', updateErr);
        message.error(getErrorMessage(updateErr) || 'Failed to update score');
        return;
      }
    }

    try {
      setOpen(false);
      await fetchStudents(selectedClassId);
    } catch (refreshErr) {
      console.error('Refresh scores failed', refreshErr);
    }
  };

  const columns = [
    { title: 'Student', dataIndex: 'fullName' },
    {
      title: 'Oral',
      render: (_: any, record: any) => {
        const score = getScore(record);
        return semester === 1 ? score?.oral1 ?? '-' : score?.oral2 ?? '-';
      },
    },
    {
      title: '15m',
      render: (_: any, record: any) => {
        const score = getScore(record);
        return semester === 1 ? score?.test15_1 ?? '-' : score?.test15_2 ?? '-';
      },
    },
    {
      title: 'Midterm',
      render: (_: any, record: any) => {
        const score = getScore(record);
        return semester === 1 ? score?.mid1 ?? '-' : score?.mid2 ?? '-';
      },
    },
    {
      title: 'Final',
      render: (_: any, record: any) => {
        const score = getScore(record);
        return semester === 1 ? score?.final1 ?? '-' : score?.final2 ?? '-';
      },
    },
    {
      title: 'Average',
      render: (_: any, record: any) => {
        const score = getScore(record);

        const oral = semester === 1 ? score?.oral1 : score?.oral2;
        const test = semester === 1 ? score?.test15_1 : score?.test15_2;
        const mid = semester === 1 ? score?.mid1 : score?.mid2;
        const final = semester === 1 ? score?.final1 : score?.final2;

        if (oral == null && test == null && mid == null && final == null) return '-';

        const avg = ((oral || 0) + (test || 0) + (mid || 0) * 2 + (final || 0) * 3) / 7;
        const color = avg >= 8 ? '#52c41a' : avg >= 5 ? '#faad14' : '#ff4d4f';

        return <span style={{ color, fontWeight: 600 }}>{avg.toFixed(1)}</span>;
      },
    },
    {
      title: 'Action',
      render: (_: any, record: any) => (
        <Button onClick={() => openAdd(record)} type="primary">
          Enter Score
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loadingExport}>
      <Card title="Enter Scores">
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select class"
            style={{ width: 200 }}
            onChange={fetchStudents}
          >
            {classes.map((clazz) => (
              <Select.Option key={clazz.id} value={clazz.id}>
                {clazz.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={semester}
            onChange={setSemester}
            style={{ width: 120, marginLeft: 10 }}
          >
            <Select.Option value={1}>HK1</Select.Option>
            <Select.Option value={2}>HK2</Select.Option>
          </Select>

          <Select
            value={exportType}
            onChange={setExportType}
            style={{ width: 120, marginLeft: 10 }}
          >
            <Select.Option value="excel">Excel</Select.Option>
            <Select.Option value="pdf">PDF</Select.Option>
          </Select>

          <Button type="primary" style={{ marginLeft: 10 }} onClick={handleExport}>
            Export
          </Button>
        </div>

        <Table rowKey="id" dataSource={students} columns={columns} />

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          title={`Enter Score - ${selectedStudent?.fullName || ''}`}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="semester" label="Semester">
              <Select>
                <Select.Option value={1}>HK1</Select.Option>
                <Select.Option value={2}>HK2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="oral" label="Oral">
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="test15" label="15m">
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="mid" label="Midterm">
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="final" label="Final">
              <InputNumber min={0} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </Spin>
  );
}
