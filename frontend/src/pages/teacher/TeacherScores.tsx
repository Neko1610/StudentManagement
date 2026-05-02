import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Card,
  Spin
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';

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

  // ================= INIT =================
  useEffect(() => {
    if (!user?.email) return;

    const load = async () => {
      const t = await teacherService.getProfile(user.email);
      setTeacher(t);

      const cls = await teacherService.getClasses(user.email);
      setClasses(cls);
    };

    load();
  }, [user?.email]);

  // ================= LOAD =================
  const fetchStudents = async (classId: number) => {
    setSelectedClassId(classId);

    if (!user?.email) return;

    const studentsRes = await teacherService.getStudentsByClass(classId);
    const scoresRes = await teacherService.getScoresByClass(
      classId,
      user.email
    );

    const merged = studentsRes.map((s: any) => ({
      ...s,
      scores: scoresRes.filter((sc: any) => sc.studentId === s.id)
    }));

    setStudents(merged);
  };

  // ================= HELPER =================
  const getScore = (r: any) =>
    r.scores?.find(
      (s: any) => s.subjectName === teacher?.subject?.name
    );

  // ================= EXPORT =================
  const handleExport = async () => {
    if (!selectedClassId) {
      message.error('Chọn lớp trước');
      return;
    }

    setLoadingExport(true);

    try {
      let blob;
      let fileName;

      if (exportType === 'excel') {
        blob = await teacherService.exportScoreExcel(
          selectedClassId,
          semester
        );
        fileName = `BangDiem_Lop${selectedClassId}_HK${semester}.xlsx`;
      } else {
        blob = await teacherService.exportScorePDF(
          selectedClassId,
          semester
        );
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
      message.error('Lỗi export');
    } finally {
      setLoadingExport(false);
    }
  };

  // ================= MODAL =================
  const openAdd = (student: any) => {
    setSelectedStudent(student);
    setOpen(true);
    form.setFieldsValue({ semester });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    const values = await form.validateFields();

    const data = {
      student: { id: selectedStudent.id },
      subject: { id: teacher.subject.id },
      semester: values.semester,
      ...values
    };

    try {
      const found = students
        .flatMap((s: any) => s.scores || [])
        .find(
          (sc: any) =>
            sc.studentId === selectedStudent.id &&
            sc.subjectName === teacher.subject.name
        );

      if (found) {
        await teacherService.updateScore(found.id, data, values.semester);
        message.success('Cập nhật thành công');
      } else {
        await teacherService.createScore(data);
        message.success('Thêm thành công');
      }

      setOpen(false);
      fetchStudents(selectedClassId!);

    } catch (err) {
      console.error(err);
      message.error('Lỗi lưu điểm');
    }
  };

  // ================= TABLE =================
  const columns = [
    { title: 'Tên học sinh', dataIndex: 'fullName' },
    {
      title: 'Miệng',
      render: (_: any, r: any) => {
        const s = getScore(r);
        return semester === 1 ? s?.oral1 ?? '-' : s?.oral2 ?? '-';
      }
    },
    {
      title: '15p',
      render: (_: any, r: any) => {
        const s = getScore(r);
        return semester === 1 ? s?.test15_1 ?? '-' : s?.test15_2 ?? '-';
      }
    },
    {
      title: 'Giữa kì',
      render: (_: any, r: any) => {
        const s = getScore(r);
        return semester === 1 ? s?.mid1 ?? '-' : s?.mid2 ?? '-';
      }
    },
    {
      title: 'Cuối kì',
      render: (_: any, r: any) => {
        const s = getScore(r);
        return semester === 1 ? s?.final1 ?? '-' : s?.final2 ?? '-';
      }
    },
    {
      title: 'Tổng',
      render: (_: any, r: any) => {
        const s = getScore(r);

        let oral, test, mid, final;

        if (semester === 1) {
          oral = s?.oral1;
          test = s?.test15_1;
          mid = s?.mid1;
          final = s?.final1;
        } else {
          oral = s?.oral2;
          test = s?.test15_2;
          mid = s?.mid2;
          final = s?.final2;
        }

        if (!oral && !test && !mid && !final) return '-';

        const avg =
          ((oral || 0) +
            (test || 0) +
            (mid || 0) * 2 +
            (final || 0) * 3) / 7;

        let color = '';
        if (avg >= 8) color = '#52c41a';
        else if (avg >= 5) color = '#faad14';
        else color = '#ff4d4f';

        return (
          <span style={{ color, fontWeight: 600 }}>
            {avg.toFixed(1)}
          </span>
        );
      }
    },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <Button onClick={() => openAdd(record)} type="primary">
          Nhập điểm
        </Button>
      )
    }
  ];

  // ================= UI =================
  return (
    <Spin spinning={loadingExport}>
      <Card title="📊 Nhập điểm">
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Chọn lớp"
            style={{ width: 200 }}
            onChange={fetchStudents}
          >
            {classes.map(c => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
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

          <Button
            type="primary"
            style={{ marginLeft: 10 }}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>

        <Table rowKey="id" dataSource={students} columns={columns} />

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          title={`Nhập điểm - ${selectedStudent?.fullName}`}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="semester" label="Học kỳ">
              <Select>
                <Select.Option value={1}>HK1</Select.Option>
                <Select.Option value={2}>HK2</Select.Option>
              </Select>
            </Form.Item>

            {semester === 1 && (
              <>
                <Form.Item name="oral1" label="Miệng">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="test15_1" label="15p">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="mid1" label="Giữa kỳ">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="final1" label="Cuối kỳ">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}

            {semester === 2 && (
              <>
                <Form.Item name="oral2" label="Miệng">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="test15_2" label="15p">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="mid2" label="Giữa kỳ">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="final2" label="Cuối kỳ">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </Card>
    </Spin>
  );
}