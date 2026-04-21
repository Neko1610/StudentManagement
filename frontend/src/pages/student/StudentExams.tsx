import { Card, List, Button, Modal, Form, Upload, message, Spin, Empty, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { studentService } from '../../api/studentService';
import { Exam } from '../../types';
import { auth } from '../../utils/auth';

export default function StudentExams() {
  const user = auth.getUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await studentService.getExams(user?.id || '');
      setExams(data);
    } catch (error) {
      message.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Exam Schedule">
        {exams.length === 0 ? (
          <Empty description="No exams scheduled" />
        ) : (
          <List
            dataSource={exams}
            renderItem={(exam) => (
              <List.Item>
                <List.Item.Meta
                  title={`Exam - Subject ${exam.subjectId}`}
                  description={
                    <>
                      <p>Date: {new Date(exam.date).toLocaleDateString()}</p>
                      <p>Time: {exam.startTime} - {exam.endTime}</p>
                      <p>Room: {exam.room || 'TBD'}</p>
                      <p>Duration: {exam.duration} minutes</p>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Spin>
  );
}
