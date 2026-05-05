import { Card, Table, Spin, Select, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { studentService } from '../../api/studentService';
import { auth } from '../../utils/auth';

export default function StudentScores() {
  const user = auth.getUser();

  const [student, setStudent] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState(1);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');

  // ================= LOAD PROFILE =================
  useEffect(() => {
    if (!user?.email) return;

    studentService
      .getProfile(user.email)
      .then(setStudent)
      .catch(() => { });
  }, [user?.email]);

  // ================= LOAD SCORES =================
  useEffect(() => {
    if (!student?.id) return;

    setLoading(true);
    studentService
      .getScores(student.id)
      .then((res) => setScores(res || []))
      .finally(() => setLoading(false));
  }, [student]);

  // ================= GPA =================
  const calcGPA = (o?: number, t?: number, m?: number, f?: number) => {
    if (o == null && t == null && m == null && f == null) return null;
    return ((o ?? 0) + (t ?? 0) + (m ?? 0) * 2 + (f ?? 0) * 3) / 7;
  };

  // ================= MAP =================
  const grouped: Record<string, any> = {};

  scores.forEach((s) => {
    if (!grouped[s.subjectName]) {
      grouped[s.subjectName] = {
        subjectName: s.subjectName
      };
    }

    Object.assign(grouped[s.subjectName], s);
  });

  const data = Object.values(grouped).map((s: any) => {
    const oral = semester === 1 ? s.oral1 : s.oral2;
    const test15 = semester === 1 ? s.test15_1 : s.test15_2;
    const mid = semester === 1 ? s.mid1 : s.mid2;
    const final = semester === 1 ? s.final1 : s.final2;

    return {
      ...s,
      oral,
      test15,
      mid,
      final,
      gpa: calcGPA(oral, test15, mid, final)
    };
  });
  // ================= GPA HK =================
  const overallGPA = () => {
    const list = data
      .map((s) => s.gpa)
      .filter((v): v is number => v != null);

    if (!list.length) return null;

    return list.reduce((a, b) => a + b, 0) / list.length;
  };

  const gpa = overallGPA();

  // ================= COLOR =================
  const getColor = (v: number) => {
    if (v < 5) return '#ff4d4f';
    if (v < 7) return '#faad14';
    return '#52c41a';
  };

  // ================= EXPORT =================
  const handleExport = async () => {
    if (!student?.id) return;

    try {
      let blob;
      let fileName;

      if (exportType === 'excel') {
        blob = await studentService.exportScores(student.id, semester);
        fileName = `BangDiem_HS_${student.id}_HK${semester}.xlsx`;
      } else {
        // ✅ truyền semester vào
        blob = await studentService.exportPdf(student.id, semester);
        fileName = `BangDiem_HS_${student.id}_HK${semester}.pdf`;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error(err);
      message.error('Lỗi export');
    }
  };
  // ================= COLUMNS =================
  const columns = [
    { title: 'Môn', dataIndex: 'subjectName' },
    {
      title: 'Miệng',
      dataIndex: 'oral',
      render: (v: number) => v ?? '-'
    },
    {
      title: '15p',
      dataIndex: 'test15',
      render: (v: number) => v ?? '-'
    },
    {
      title: 'Giữa kỳ',
      dataIndex: 'mid',
      render: (v: number) => v ?? '-'
    },
    {
      title: 'Cuối kỳ',
      dataIndex: 'final',
      render: (v: number) => v ?? '-'
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      render: (v: number) =>
        v != null ? (
          <b style={{ color: getColor(v) }}>{v.toFixed(2)}</b>
        ) : '-'
    }
  ];

  // ================= UI =================
  return (
    <Spin spinning={loading}>
      <Card
        title={`📊 GPA HK${semester}: ${gpa != null ? gpa.toFixed(2) : '--'
          }`}
        extra={
          <>
            <Select
              value={semester}
              onChange={setSemester}
              options={[
                { value: 1, label: 'HK1' },
                { value: 2, label: 'HK2' }
              ]}
              style={{ width: 100 }}
            />

            <Select
              value={exportType}
              onChange={setExportType}
              style={{ width: 100, marginLeft: 10 }}
            >
              <Select.Option value="excel">Excel</Select.Option>
              <Select.Option value="pdf">PDF</Select.Option>
            </Select>

            <Button
              style={{ marginLeft: 10 }}
              onClick={handleExport}
            >
              Export
            </Button>
          </>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'Chưa có điểm' }}
        />
      </Card>
    </Spin>
  );
}