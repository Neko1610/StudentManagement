import { Button, Card, Empty, List, Space, Spin, Table, Tabs, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { parentService } from '../../api/parentService';
import { auth } from '../../utils/auth';
import { Student } from '../../types';

const { Title, Text } = Typography;

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

export default function ParentStudents() {
  const user = auth.getUser();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mergedScores = useMemo(() => mergeScoresBySubject(scores), [scores]);

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
                            <Button onClick={() => window.open(parentService.exportScoresExcelUrl(selectedChild.id), '_blank')}>
                              Export Excel
                            </Button>
                            <Button onClick={() => window.open(parentService.exportScoresPdfUrl(selectedChild.id), '_blank')}>
                              Export PDF
                            </Button>
                          </Space>
                          <Table
                            rowKey="subjectName"
                            dataSource={mergedScores}
                            pagination={false}
                            columns={[
                              { title: 'Subject', dataIndex: 'subjectName' },
                              { title: 'Oral 1', dataIndex: 'oral1' },
                              { title: '15p 1', dataIndex: 'test15_1' },
                              { title: 'Mid 1', dataIndex: 'mid1' },
                              { title: 'Final 1', dataIndex: 'final1' },
                              { title: 'Oral 2', dataIndex: 'oral2' },
                              { title: '15p 2', dataIndex: 'test15_2' },
                              { title: 'Mid 2', dataIndex: 'mid2' },
                              { title: 'Final 2', dataIndex: 'final2' },
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
                          rowKey="id"
                          dataSource={attendance}
                          pagination={{ pageSize: 8 }}
                          columns={[
                            { title: 'Date', dataIndex: 'date' },
                            { title: 'Period', dataIndex: 'period' },
                            {
                              title: 'Status',
                              dataIndex: 'status',
                              render: (status) => (
                                <Tag color={status === 'PRESENT' ? 'green' : status === 'LATE' ? 'gold' : 'red'}>
                                  {status}
                                </Tag>
                              ),
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
