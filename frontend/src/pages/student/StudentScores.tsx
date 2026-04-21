import { Card, Table, Spin, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { studentService } from '../../api/studentService';
import { auth } from '../../utils/auth';
import { Score } from '../../types';

export default function StudentScores() {

  const user = auth.getUser();

  const [student, setStudent] = useState<any>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🔥 LOAD STUDENT
  useEffect(() => {
    if (!user?.email) return;

    const loadStudent = async () => {
      try {
        const res = await studentService.getProfile(user.email);
        setStudent(res);
      } catch (err) {
        console.error(err);
      }
    };

    loadStudent();
  }, [user?.email]);

  // 🔥 LOAD SCORES
  useEffect(() => {
    if (!student?.id) return;

    loadScores(student.id);
  }, [student]);

  const loadScores = async (studentId: number) => {
    try {
      setLoading(true);

      const res = await studentService.getScores(studentId);
      setScores(res || []);

    } catch (err) {
      console.error(err);
      message.error('Load scores failed');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 EXPORT
const handleExport = async () => {
  if (!student?.id) {
    message.error('Student not found');
    return;
  }

  try {
    const blob = await studentService.exportScores(student.id);

    // 🔥 tạo file
    const url = window.URL.createObjectURL(
      new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    );

    const link = document.createElement('a');
    link.href = url;

    // 🔥 đặt tên file đẹp hơn
    link.download = `scores_${student.id}.xlsx`;

    document.body.appendChild(link);
    link.click();

    // cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

    message.success('Export success');

  } catch (err) {
    console.error(err);
    message.error('Export failed');
  }
};
  const columns = [
    { title: 'Subject', dataIndex: 'subjectName' },
    { title: 'Assignment', dataIndex: 'assignmentScore' },
    { title: 'Midterm', dataIndex: 'midtermScore' },
    { title: 'Final', dataIndex: 'finalScore' },
    {
      title: 'Average',
      dataIndex: 'averageScore',
      render: (value: number) => {
        if (value == null) return '-';

        let color = 'green';
        if (value < 5) color = 'red';
        else if (value < 7) color = 'orange';

        return <b style={{ color }}>{value.toFixed(2)}</b>;
      }
    }
  ];

  return (
    <Spin spinning={loading}>
      <Card
        title="📊 My Scores"
        extra={<Button onClick={handleExport}>Export Excel</Button>}
      >
        <Table
          columns={columns}
          dataSource={scores}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </Spin>
  );
}