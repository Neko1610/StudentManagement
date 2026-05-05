import { Button, Card, Empty, List, Select, Space, Spin, Table, Tabs, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { parentService } from '../../api/parentService';
import { studentService } from '../../api/studentService';
import { auth } from '../../utils/auth';
import { Attendance, Student } from '../../types';
import { normalizeAttendanceList } from '../../utils/attendance';

const { Title, Text } = Typography;

type SemesterKey = 'HK1' | 'HK2';

interface AttendanceDateRow {
  date: string;
  records: Attendance[];
}

interface ScoreRow {
  subjectName: string;
  oral?: number;
  p15?: number;
  mid?: number;
  final?: number;
}

const mergeScoresBySubject = (scores: any[]) => {
  const bySubject = new Map<string, any>();

  scores.forEach((score) => {
    const key = score.subjectName || score.subject || 'Unknown';
    const current = bySubject.get(key) || { subjectName: key };
    bySubject.set(key, {
      ...current,
      ...Object.fromEntries(
        Object.entries(score).filter(([, value]) => value !== null && value !== undefined && value !== '')
      ),
      subjectName: key,
    });
  });

  return Array.from(bySubject.values());
};

const downloadBlob = (blob: BlobPart, fileName: string) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default function ParentStudents() {
  const user = auth.getUser();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>('HK1');

  const mergedScores = useMemo(() => mergeScoresBySubject(scores), [scores]);

  const scoreRows = useMemo<ScoreRow[]>(() => {
    return mergedScores.map((score) => {
      const isHK1 = selectedSemester === 'HK1';

      return {
        subjectName: score.subjectName,
        oral: isHK1 ? score.oral1 : score.oral2,
        p15: isHK1 ? score.p151 ?? score.test15_1 : score.p152 ?? score.test15_2,
        mid: isHK1 ? score.mid1 : score.mid2,
        final: isHK1 ? score.final1 : score.final2,
      };
    });
  }, [mergedScores, selectedSemester]);

  const attendanceRows = useMemo<AttendanceDateRow[]>(() => {
    const byDate = new Map<string, Attendance[]>();

    normalizeAttendanceList(attendance).forEach((record) => {
      byDate.set(record.date, [...(byDate.get(record.date) || []), record]);
    });

    return Array.from(byDate.entries()).map(([date, records]) => ({
      date,
      records,
    }));
  }, [attendance]);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await parentService.getChildren(user?.email || '');
      setChildren(data || []);
      if (data?.length) {
        await selectChild(data[0]);
      }
    } catch {
      message.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const selectChild = async (child: Student) => {
    try {
      setLoading(true);
      setSelectedChild(child);
      const [scoreData, attendanceData, assignmentData] = await Promise.all([
        parentService.getScoresByStudent(Number(child.id)),
        parentService.getAttendanceByStudent(Number(child.id)),
        parentService.getAssignmentsByStudent(Number(child.id)),
      ]);
      setScores(scoreData || []);
      setAttendance(attendanceData || []);
      setAssignments(assignmentData || []);
    } catch {
      message.error('Failed to load child data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedChild) return;

    try {
      const blob = await studentService.exportScoresBySemester(selectedSemester, Number(selectedChild.id));
      downloadBlob(blob, `BangDiem_${selectedSemester}.xlsx`);
    } catch (error) {
      console.error(error);
      message.error('Failed to export Excel');
    }
  };

  const handleExportPdf = async () => {
    if (!selectedChild) return;

    try {
      const blob = await studentService.exportPdfBySemester(selectedSemester, Number(selectedChild.id));
      downloadBlob(blob, `BangDiem_${selectedSemester}.pdf`);
    } catch (error) {
      console.error(error);
      message.error('Failed to export PDF');
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">My Children</Title>
            <div className="page-subtitle">View scores, attendance, and assignments for each child.</div>
          </div>
        </div>

        {children.length === 0 ? (
          <Card>
            <Empty description="No children" />
          </Card>
        ) : (
          <>
            <Card>
              <List
                dataSource={children}
                renderItem={(child) => (
                  <List.Item
                    className="soft-list-item"
                    actions={[
                      <Button type={selectedChild?.id === child.id ? 'primary' : 'default'} onClick={() => selectChild(child)}>
                        View Data
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<Text strong>{child.fullName}</Text>}
                      description={`Class: ${child.className || (child as any).studentClass?.name || 'N/A'} | Phone: ${child.phone || 'N/A'}`}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {selectedChild && (
              <Card title={selectedChild.fullName}>
                <Tabs
                  items={[
                    {
                      key: 'scores',
                      label: 'Scores',
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }} size={16}>
                          <Space wrap>
                            <Select
                              value={selectedSemester}
                              onChange={setSelectedSemester}
                              options={[
                                { value: 'HK1', label: 'HK1' },
                                { value: 'HK2', label: 'HK2' },
                              ]}
                              style={{ width: 120 }}
                            />
                            <Button onClick={handleExportExcel}>
                              Export Excel
                            </Button>
                            <Button onClick={handleExportPdf}>
                              Export PDF
                            </Button>
                          </Space>

                          <Table
                            rowKey="subjectName"
                            dataSource={scoreRows}
                            pagination={false}
                            columns={[
                              { title: 'Subject', dataIndex: 'subjectName' },
                              { title: 'Oral', dataIndex: 'oral', render: (value) => value ?? '-' },
                              { title: 'P15', dataIndex: 'p15', render: (value) => value ?? '-' },
                              { title: 'Mid', dataIndex: 'mid', render: (value) => value ?? '-' },
                              { title: 'Final', dataIndex: 'final', render: (value) => value ?? '-' },
                            ]}
                          />
                        </Space>
                      ),
                    },
                    {
                      key: 'attendance',
                      label: 'Attendance',
                      children: (
                        <Table
                          rowKey="date"
                          dataSource={attendanceRows}
                          pagination={{ pageSize: 8 }}
                          size="middle"
                          columns={[
                            {
                              title: 'Date',
                              dataIndex: 'date',
                              width: 140,
                            },
                            {
                              title: 'Attendance',
                              render: (_, row: AttendanceDateRow) => (
                                <Space size={8} wrap>
                                  {row.records.map((record) => (
                                    <Tag
                                      key={`${record.studentId}-${record.period}`}
                                      color={record.status === 'PRESENT' ? 'green' : record.status === 'LATE' ? 'gold' : 'red'}
                                    >
                                      {`Period ${record.period || '-'}: ${record.status}`}
                                    </Tag>
                                  ))}
                                </Space>
                              ),
                            },
                            {
                              title: 'Remark',
                              render: (_, row: AttendanceDateRow) => {
                                const remarks = row.records.map((record) => record.remark).filter(Boolean);
                                return remarks.length ? remarks.join(', ') : '-';
                              },
                            },
                          ]}
                        />
                      ),
                    },
                    {
                      key: 'assignments',
                      label: 'Assignments',
                      children: (
                        <Table
                          rowKey="id"
                          dataSource={assignments}
                          pagination={{ pageSize: 8 }}
                          columns={[
                            { title: 'Title', dataIndex: 'title' },
                            { title: 'Subject', dataIndex: 'subject' },
                            { title: 'Due Date', dataIndex: 'dueDate' },
                            {
                              title: 'Status',
                              dataIndex: 'status',
                              render: (status) => (
                                <Tag color={status === 'SUBMITTED' ? 'green' : 'red'}>
                                  {status === 'SUBMITTED' ? 'Submitted' : 'Missing'}
                                </Tag>
                              ),
                            },
                            {
                              title: 'Submitted At',
                              dataIndex: 'submittedAt',
                              render: (value) => value ? new Date(value).toLocaleString() : '-',
                            },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </Spin>
  );
}
