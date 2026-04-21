import { Card, Empty, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { parentService } from '../../api/parentService';
import { auth } from '../../utils/auth';

export default function ParentTeachers() {
  const user = auth.getUser();

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacher();
  }, []);

  const loadTeacher = async () => {
    try {
      const children = await parentService.getChildren(user?.email || '');

      if (!children.length) return;

      const homeroom =
        (children[0] as any).studentClass?.homeroomTeacher;

      setTeacher(homeroom);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Homeroom Teacher">
        {!teacher ? (
          <Empty description="No teacher" />
        ) : (
          <>
            <p><b>Name:</b> {teacher.fullName}</p>
            <p><b>Email:</b> {teacher.email}</p>
            <p><b>Phone:</b> {teacher.phone}</p>
            <p><b>Subject:</b> {teacher.subject?.name}</p>
          </>
        )}
      </Card>
    </Spin>
  );
}