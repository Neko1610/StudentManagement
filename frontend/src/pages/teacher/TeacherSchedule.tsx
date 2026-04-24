import { useEffect, useState, useMemo } from 'react';
import { Card, Spin } from 'antd';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';
import '../student/schedule.css';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const PERIOD_TIME: any = {
  1: '07:00 - 07:45',
  2: '07:50 - 08:35',
  3: '08:40 - 09:25',
  4: '09:35 - 10:20',
  5: '10:30 - 11:15',
  6: '12:45 - 13:30',
  7: '13:35 - 14:20',
  8: '14:25 - 15:10',
  9: '15:15 - 16:45',
};

export default function TeacherSchedule() {
  const user = useMemo(() => auth.getUser(), []);

  const [gridMap, setGridMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    loadData(user.email);
  }, [user?.email]);

  const loadData = async (email: string) => {
    try {
      setLoading(true);
      const scheduleRes = await teacherService.getSchedule(email);
      buildGrid(scheduleRes);
    } catch (err) {
      console.error('LOAD ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildGrid = (data: any[]) => {
    const map: any = {};

    data.forEach((item) => {
      const key = `${item.dayOfWeek}_${item.period}`;

      map[key] = {
        className: item.className,
        subjectName: item.subjectName,
        room: item.room,
      };
    });

    setGridMap(map);
  };

  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Spin spinning={loading}>
      <Card title="Weekly Timetable">
        <div className="schedule-shell">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Period</th>
                {DAYS.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {periods.map((p) => (
                <tr key={p}>
                  <td className="period-cell">
                    <b>Period {p}</b>
                    <small>{PERIOD_TIME[p]}</small>
                  </td>

                  {DAYS.map((day) => {
                    const key = `${day.toUpperCase()}_${Number(p)}`;
                    const cell = gridMap[key];

                    return (
                      <td key={day}>
                        {cell ? (
                          <div className="schedule-card">
                            <div className="class">{cell.className}</div>
                            <div>{cell.subjectName}</div>
                            <div className="room">Room: {cell.room || '-'}</div>
                          </div>
                        ) : (
                          <span className="empty">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Spin>
  );
}
