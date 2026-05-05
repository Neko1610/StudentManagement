import { Card, Spin } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { studentService } from '../../api/studentService';
import { auth } from '../../utils/auth';
import './schedule.css';
import { Schedule } from '../../types';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const DAY_LABEL: any = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6'
};

const PERIODS = [
  { period: 1, time: '07:00 - 07:45' },
  { period: 2, time: '07:50 - 08:35' },
  { period: 3, time: '08:40 - 09:25' },
  { period: 4, time: '09:35 - 10:20' },
  { period: 5, time: '10:30 - 11:15' },
  { period: 6, time: '12:45 - 13:30' },
  { period: 7, time: '13:35 - 14:20' },
  { period: 8, time: '14:25 - 15:10' },
  { period: 9, time: '15:15 - 16:45' },
];

export default function StudentSchedule() {

  const user = auth.getUser();

  const [student, setStudent] = useState<any>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== LOAD STUDENT =====
  useEffect(() => {
    if (!user?.email) return;

    const load = async () => {
      try {
        const res = await studentService.getProfile(user.email);
        setStudent(res);
      } catch (err) {
        console.error("Load student lỗi:", err);
      }
    };

    load();
  }, [user?.email]);

  // ===== LOAD SCHEDULE =====
  useEffect(() => {
    if (!student?.classId) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await studentService.getScheduleByClass(student.classId);
        setSchedule(res || []);
      } catch (err) {
        console.error("Load schedule lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [student]);

  // ===== OPTIMIZE MAP =====
  const scheduleMap = useMemo(() => {
    const map = new Map<string, Schedule>();

    schedule.forEach(s => {
      map.set(`${s.dayOfWeek}_${s.period}`, s);
    });

    return map;
  }, [schedule]);

  const getCell = (day: string, period: number) => {
    return scheduleMap.get(`${day}_${period}`);
  };

  // ===== GET CURRENT DAY =====
  const today = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();

  return (
    <Spin spinning={loading}>
      <Card title="Weekly Timetable">

        <div className="schedule-shell">
          <table className="schedule-table">

            <thead>
              <tr>
                <th>Tiết</th>
                {DAYS.map(d => (
                  <th key={d} className={d === today ? 'today-col' : ''}>
                    {DAY_LABEL[d]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {PERIODS.map(p => (
                <tr key={p.period}>

                  {/* PERIOD */}
                  <td className="period-cell">
                    <b>Tiết {p.period}</b>
                    <div>{p.time}</div>
                  </td>

                  {/* DAYS */}
                  {DAYS.map(day => {
                    const cell = getCell(day, p.period);

                    return (
                      <td key={day} className={day === today ? 'today-col' : ''}>
                        {cell ? (
                          <div className="schedule-card">
                            <div className="subject">{cell.subjectName}</div>
                            <div className="teacher">
                              {cell.teacherName || 'Chưa có GV'}
                            </div>
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
