import {
  Card, Table, Button, Modal,
  Form, Select, InputNumber,
  message
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';

export default function TeacherScores() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<any>(null);

  const [form] = Form.useForm();

  // 🔥 LOAD INIT
  useEffect(() => {
    if (user?.email) {
      loadInit();
    }
  }, [user?.email]);

  const loadInit = async () => {
    const cls = await teacherService.getClasses(user!.email);
    const sub = await teacherService.getSubjects();

    setClasses(cls);
    setSubjects(sub);
  };

  // 🔥 LOAD DATA THEO CLASS
  const loadData = async (classId: number) => {
    setSelectedClass(classId);

    const stu = await teacherService.getStudentsByClass(classId);
    const sc = await teacherService.getScoresByClass(classId);

    setStudents(stu);
    setScores(sc);
  };

  // 🔥 CALC AVERAGE
  const calcAverage = (r: any): string => {
    const tx = [r.oral1, r.test15_1].filter(v => v != null);

    const sumTX = tx.reduce((a, b) => a + b, 0);
    const countTX = tx.length;

    const mid = r.mid1 || 0;
    const final = r.final1 || 0;

    if (countTX === 0) return "0.00"; // ✅ FIX

    const avg = (sumTX + 2 * mid + 3 * final) / (countTX + 5);

    return avg.toFixed(2);
  };
  // 🔥 CREATE / UPDATE
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        student: { id: values.studentId },
        subject: { id: values.subjectId },

        oral1: values.oral1,
        test15_1: values.test15,
        mid1: values.mid,
        final1: values.final
      };

      if (editingScore) {
        await teacherService.updateScore(editingScore.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await teacherService.createScore(payload);
        message.success("Thêm thành công");
      }

      setModalOpen(false);
      setEditingScore(null);
      form.resetFields();

      if (selectedClass) loadData(selectedClass);

    } catch {
      message.error("Lỗi");
    }
  };

  // 🔥 EDIT
  const handleEdit = (r: any) => {
    setEditingScore(r);
    setModalOpen(true);

    form.setFieldsValue({
      studentId: r.student?.id,
      subjectId: r.subject?.id,
      oral1: r.oral1,
      test15: r.test15_1,
      mid: r.mid1,
      final: r.final1
    });
  };

  // 🔥 DELETE
  const handleDelete = async (id: number) => {
    await teacherService.deleteScore(id);
    message.success("Đã xóa");

    if (selectedClass) loadData(selectedClass);
  };
  const handleExport = async () => {
    if (!selectedClass) return;

    const blob = await teacherService.exportScoreExcel(selectedClass);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "scores.xlsx";
    a.click();
  };
  // 🔥 TABLE
  const columns = [
    {
      title: 'Student',
      render: (_: any, r: any) => r.student?.fullName
    },
    {
      title: 'Subject',
      render: (_: any, r: any) => r.subject?.name
    },
    { title: 'Oral', dataIndex: 'oral1' },
    { title: '15p', dataIndex: 'test15_1' },
    { title: 'Mid', dataIndex: 'mid1' },
    { title: 'Final', dataIndex: 'final1' },

    // 🔥 AVERAGE
    {
      title: 'Average',
      render: (_: any, r: any) => {
        const avg = parseFloat(calcAverage(r));

        let color = 'black';
        if (avg >= 8) color = 'green';
        else if (avg < 5) color = 'red';

        return <b style={{ color }}>{avg}</b>;
      }
    },

    // 🔥 ACTION
    {
      title: 'Action',
      render: (_: any, r: any) => (
        <>
          <Button onClick={() => handleEdit(r)} style={{ marginRight: 8 }}>
            Edit
          </Button>

          <Button danger onClick={() => handleDelete(r.id)}>
            Delete
          </Button>
        </>
      )
    }
  ];

  return (
    <Card title="Scores">

      {/* SELECT CLASS */}
      <Select
        placeholder="Chọn lớp"
        style={{ width: 200 }}
        onChange={loadData}
      >
        {classes.map(c => (
          <Select.Option key={c.id} value={c.id}>
            {c.name}
          </Select.Option>
        ))}
      </Select>

      {/* ADD */}
      <Button
        type="primary"
        style={{ marginLeft: 10 }}
        disabled={!selectedClass}
        onClick={() => {
          setEditingScore(null);
          form.resetFields();
          setModalOpen(true);
        }}
      >
        Add Score
      </Button>
      <Button
        style={{ marginLeft: 10 }}
        disabled={!selectedClass}
        onClick={handleExport}
      >
        Export Excel
      </Button>
      {/* TABLE */}
      <Table
        dataSource={scores}
        columns={columns}
        rowKey="id"
        style={{ marginTop: 20 }}
      />

      {/* MODAL */}
      <Modal
        title="Add Score"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingScore(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">

          <Form.Item
            name="studentId"
            label="Student"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn học sinh">
              {students.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subjectId"
            label="Subject"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn môn">
              {subjects.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="oral1" label="Oral 1">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="test15" label="15 min test">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="mid" label="Midterm">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="final" label="Final">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

        </Form>
      </Modal>

    </Card>
  );
}