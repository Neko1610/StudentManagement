import { useEffect, useState, useMemo } from 'react';
import { Card, Spin } from 'antd';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const PERIOD_TIME: any = {
  1: "07:00 - 07:45",
  2: "07:50 - 08:35",
  3: "08:40 - 09:25",
  4: "09:35 - 10:20",
  5: "10:30 - 11:15",
  6: "12:45 - 13:30",
  7: "13:35 - 14:20",
  8: "14:25 - 15:10",
  9: "15:15 - 16:45"
};

export default function TeacherSchedule() {
  // 🔥 FIX: tránh re-render loop
  const user = useMemo(() => auth.getUser(), []);

  const [gridMap, setGridMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD DATA
  useEffect(() => {
    if (!user?.email) return;
    loadData(user.email);
  }, [user?.email]);

  const loadData = async (email: string) => {
    try {
      setLoading(true);

      const scheduleRes = await teacherService.getSchedule(email);

      console.log("SCHEDULE RAW:", scheduleRes);
      console.log("FULL DATA:", scheduleRes);
    console.log("FIRST ITEM:", scheduleRes[0]);
      buildGrid(scheduleRes);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 BUILD GRID CHUẨN
 const buildGrid = (data: any[]) => {
  const map: any = {};

  data.forEach(item => {
    const key = `${item.dayOfWeek}_${item.period}`;

    map[key] = {
      className: item.className,
      subjectName: item.subjectName,
      room: item.room
    };
  });

  setGridMap(map);
};

  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Spin spinning={loading}>
      <Card title="📅 Weekly Timetable">
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center'
          }}>
            <thead>
              <tr>
                <th style={th}>Period</th>
                {DAYS.map(day => (
                  <th key={day} style={th}>{day}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {periods.map(p => (
                <tr key={p}>
                  <td style={td}>
                    <b>Tiết {p}</b><br />
                    <small>{PERIOD_TIME[p]}</small>
                  </td>

                  {DAYS.map(day => {
                    const key = `${day.toUpperCase()}_${Number(p)}`;
                    const cell = gridMap[key];
                    console.log("CHECK KEY:", key, gridMap[key]);
                    return (
                      <td key={day} style={td}>
                        {cell ? (
                          <div style={{
                            background: '#e6f7ff',
                            padding: 6,
                            borderRadius: 6
                          }}>
                            <b>{cell.className}</b><br />
                            <small>{cell.subjectName}</small><br />
                            <span style={{ fontSize: 12, color: '#888' }}>
                              Room: {cell.room}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#bbb' }}>-</span>
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

const th = {
  border: '1px solid #ddd',
  padding: 10,
  background: '#f5f5f5'
};

const td = {
  border: '1px solid #ddd',
  padding: 12
};