import {
  Button,
  Card,
  Empty,
  message,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { adminService } from '../../api/adminService';

const { Title, Text } = Typography;

type ScheduleItem = {
  id: number;
  dayOfWeek: string;
  period: number;
  className?: string;
  subjectName?: string;
  teacherName?: string;
  room?: string;
  clazz?: {
    id?: number;
    name?: string;
    room?: string;
  };
  subject?: {
    id?: number;
    name?: string;
  };
  teacher?: {
    id?: number;
    fullName?: string;
  };
};

type NormalizedSchedule = {
  id: number;
  dayKey: string;
  period: number;
  className: string;
  subjectName: string;
  teacherName: string;
  room?: string;
};

type ScheduleGrid = Record<string, Record<number, NormalizedSchedule[]>>;

const DAYS = [
  { key: 'MONDAY', label: 'Thứ 2', jsDay: 1 },
  { key: 'TUESDAY', label: 'Thứ 3', jsDay: 2 },
  { key: 'WEDNESDAY', label: 'Thứ 4', jsDay: 3 },
  { key: 'THURSDAY', label: 'Thứ 5', jsDay: 4 },
  { key: 'FRIDAY', label: 'Thứ 6', jsDay: 5 },
  { key: 'SATURDAY', label: 'Thứ 7', jsDay: 6 },
];

const PERIODS = Array.from({ length: 9 }, (_, index) => index + 1);

const DAY_ORDER = DAYS.reduce<Record<string, number>>((acc, day, index) => {
  acc[day.key] = index;
  return acc;
}, {});

const DAY_ALIASES: Record<string, string> = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  'THU 2': 'MONDAY',
  'THU 3': 'TUESDAY',
  'THU 4': 'WEDNESDAY',
  'THU 5': 'THURSDAY',
  'THU 6': 'FRIDAY',
  'THU 7': 'SATURDAY',
  'THU_2': 'MONDAY',
  'THU_3': 'TUESDAY',
  'THU_4': 'WEDNESDAY',
  'THU_5': 'THURSDAY',
  'THU_6': 'FRIDAY',
  'THU_7': 'SATURDAY',
  '2': 'MONDAY',
  '3': 'TUESDAY',
  '4': 'WEDNESDAY',
  '5': 'THURSDAY',
  '6': 'FRIDAY',
  '7': 'SATURDAY',
};

const SPECIAL_SLOTS: Record<string, Record<number, string>> = {
  MONDAY: {
    1: 'Chào cờ',
    2: 'SHCN',
  },
};

const SUBJECT_COLORS = {
  math: {
    background: '#EAF3FF',
    border: '#91C7FF',
    text: '#0958D9',
  },
  literature: {
    background: '#FFF1F0',
    border: '#FFA39E',
    text: '#CF1322',
  },
  english: {
    background: '#F0FFF4',
    border: '#95DE64',
    text: '#237804',
  },
  other: {
    background: '#F6F8FA',
    border: '#D9DEE7',
    text: '#475569',
  },
};

const normalizeVietnamese = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .trim();

const normalizeDayKey = (dayOfWeek?: string) => {
  if (!dayOfWeek) return '';

  const normalized = normalizeVietnamese(dayOfWeek).replace(/\s+/g, ' ');
  return DAY_ALIASES[normalized] || normalized;
};

const getSubjectColor = (subjectName: string) => {
  const normalized = normalizeVietnamese(subjectName).toLowerCase();

  if (normalized.includes('toan')) return SUBJECT_COLORS.math;
  if (normalized.includes('van') || normalized.includes('ngu van')) {
    return SUBJECT_COLORS.literature;
  }
  if (
    normalized.includes('anh') ||
    normalized.includes('tieng anh') ||
    normalized.includes('english')
  ) {
    return SUBJECT_COLORS.english;
  }

  return SUBJECT_COLORS.other;
};

const normalizeSchedule = (schedule: ScheduleItem): NormalizedSchedule => ({
  id: schedule.id,
  dayKey: normalizeDayKey(schedule.dayOfWeek),
  period: Number(schedule.period),
  className: schedule.className || schedule.clazz?.name || '-',
  subjectName: schedule.subjectName || schedule.subject?.name || '-',
  teacherName: schedule.teacherName || schedule.teacher?.fullName || '-',
  room: schedule.room || schedule.clazz?.room,
});

const sortSchedules = (schedules: NormalizedSchedule[]) =>
  [...schedules].sort((a, b) => {
    const dayDiff =
      (DAY_ORDER[a.dayKey] ?? Number.MAX_SAFE_INTEGER) -
      (DAY_ORDER[b.dayKey] ?? Number.MAX_SAFE_INTEGER);

    if (dayDiff !== 0) return dayDiff;
    return a.period - b.period;
  });

const transformToGrid = (schedules: NormalizedSchedule[]): ScheduleGrid => {
  const grid: ScheduleGrid = {};

  DAYS.forEach((day) => {
    grid[day.key] = {};
    PERIODS.forEach((period) => {
      grid[day.key][period] = [];
    });
  });

  sortSchedules(schedules).forEach((schedule) => {
    if (!grid[schedule.dayKey] || !PERIODS.includes(schedule.period)) return;
    grid[schedule.dayKey][schedule.period].push(schedule);
  });

  return grid;
};

const renderTooltipContent = (
  schedules: NormalizedSchedule[],
  specialLabel?: string
) => (
  <div style={{ minWidth: 180 }}>
    {specialLabel && (
      <div style={{ marginBottom: schedules.length ? 8 : 0 }}>
        <Text strong style={{ color: '#fff' }}>
          {specialLabel}
        </Text>
      </div>
    )}

    {schedules.length ? (
      <Space direction="vertical" size={8}>
        {schedules.map((schedule) => (
          <div key={schedule.id}>
            <div>
              <Text strong style={{ color: '#fff' }}>
                Môn:
              </Text>{' '}
              {schedule.subjectName}
            </div>
            <div>Giáo viên: {schedule.teacherName}</div>
            <div>Lớp: {schedule.className}</div>
            {schedule.room && <div>Phòng: {schedule.room}</div>}
          </div>
        ))}
      </Space>
    ) : (
      !specialLabel && <span>Chưa có lịch</span>
    )}
  </div>
);

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<NormalizedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const grid = useMemo(() => transformToGrid(schedules), [schedules]);

  const currentDayKey = useMemo(() => {
    const today = new Date().getDay();
    return DAYS.find((day) => day.jsDay === today)?.key;
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSchedules();
      const normalizedSchedules = (data || []).map(normalizeSchedule);
      setSchedules(sortSchedules(normalizedSchedules));
    } catch {
      message.error('Không thể tải thời khóa biểu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleGenerate = async () => {
    const generateSchedule = (
      adminService as typeof adminService & {
        generateSchedule?: () => Promise<unknown>;
      }
    ).generateSchedule;

    if (!generateSchedule) {
      message.warning('Backend chưa hỗ trợ auto generate');
      return;
    }

    try {
      setGenerating(true);
      await generateSchedule();
      await loadSchedules();
      message.success('Đã tạo thời khóa biểu');
    } catch {
      message.error('Không thể tạo thời khóa biểu');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await adminService.deleteSchedule(id);
      setSchedules((current) => current.filter((item) => item.id !== id));
      message.success('Đã xóa lịch học');
    } catch {
      message.error('Không thể xóa lịch học');
    } finally {
      setDeletingId(null);
    }
  };

  const renderScheduleItem = (schedule: NormalizedSchedule) => {
    const colors = getSubjectColor(schedule.subjectName);

    return (
      <div
        key={schedule.id}
        style={{
          ...scheduleBlockStyle,
          background: colors.background,
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <div style={subjectStyle}>{schedule.subjectName}</div>
        <div style={metaStyle}>{schedule.teacherName}</div>
        <div style={metaStyle}>{schedule.className}</div>

        <Popconfirm
          title="Xóa lịch học này?"
          okText="Xóa"
          cancelText="Hủy"
          onConfirm={() => handleDelete(schedule.id)}
        >
          <Button
            danger
            type="text"
            size="small"
            loading={deletingId === schedule.id}
            icon={<DeleteOutlined />}
            style={deleteButtonStyle}
            aria-label="Xóa lịch học"
          />
        </Popconfirm>
      </div>
    );
  };

  const renderCell = (dayKey: string, period: number) => {
    const cellSchedules = grid[dayKey][period];
    const specialLabel = SPECIAL_SLOTS[dayKey]?.[period];
    const isCurrentDay = dayKey === currentDayKey;
    const isSpecialSlot = Boolean(specialLabel);

    return (
      <Tooltip
        key={`${dayKey}-${period}`}
        placement="top"
        title={renderTooltipContent(cellSchedules, specialLabel)}
      >
        <div
          style={{
            ...cellStyle,
            ...(isCurrentDay ? currentDayCellStyle : {}),
            ...(isSpecialSlot ? specialCellStyle : {}),
          }}
        >
          {specialLabel && <div style={specialLabelStyle}>{specialLabel}</div>}

          {cellSchedules.length ? (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {cellSchedules.map(renderScheduleItem)}
            </Space>
          ) : (
            <Text type="secondary" style={emptySlotStyle}>
              {specialLabel ? '' : '-'}
            </Text>
          )}
        </div>
      </Tooltip>
    );
  };

  return (
    <div style={pageStyle}>
      <Spin spinning={loading}>
        <div style={headerStyle}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E00A9' }}>
              Quản lý thời khóa biểu
            </Title>
            <Text type="secondary">
              Theo dõi lịch học theo ngày trong tuần và tiết học
            </Text>
          </div>

          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={loadSchedules}>
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              loading={generating}
              onClick={handleGenerate}
              style={primaryButtonStyle}
            >
              Tạo thời khóa biểu
            </Button>
          </Space>
        </div>

        <Card bordered={false} style={cardStyle}>
          {schedules.length ? (
            <div style={scrollAreaStyle}>
              <div style={gridStyle}>
                <div style={cornerHeaderStyle}>Ngày / Tiết</div>

                {PERIODS.map((period) => (
                  <div key={period} style={periodHeaderStyle}>
                    Tiết {period}
                  </div>
                ))}

                {DAYS.map((day) => (
                  <div key={day.key} style={{ display: 'contents' }}>
                    <div
                      style={{
                        ...dayHeaderStyle,
                        ...(day.key === currentDayKey ? currentDayHeaderStyle : {}),
                      }}
                    >
                      <Text strong>{day.label}</Text>
                      {day.key === currentDayKey && (
                        <Text style={todayBadgeStyle}>Hôm nay</Text>
                      )}
                    </div>

                    {PERIODS.map((period) => renderCell(day.key, period))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Empty description="Chưa có dữ liệu thời khóa biểu" />
          )}
        </Card>
      </Spin>
    </div>
  );
}

const pageStyle: CSSProperties = {
  padding: 32,
  background: '#F8F9FA',
  minHeight: '100vh',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 32,
  flexWrap: 'wrap',
};

const primaryButtonStyle: CSSProperties = {
  background: '#3525CD',
  borderRadius: 10,
  height: 40,
  fontWeight: 700,
  boxShadow: '0 4px 10px rgba(53,37,205,0.2)',
};

const cardStyle: CSSProperties = {
  borderRadius: 16,
  borderLeft: '4px solid #3525CD',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
};

const scrollAreaStyle: CSSProperties = {
  overflowX: 'auto',
  paddingBottom: 4,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '130px repeat(9, minmax(132px, 1fr))',
  minWidth: 1320,
  borderTop: '1px solid #D9DEE7',
  borderLeft: '1px solid #D9DEE7',
  background: '#FFFFFF',
};

const cornerHeaderStyle: CSSProperties = {
  padding: '14px 12px',
  minHeight: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  color: '#475569',
  background: '#F1F5F9',
  borderRight: '1px solid #D9DEE7',
  borderBottom: '1px solid #D9DEE7',
};

const periodHeaderStyle: CSSProperties = {
  padding: '14px 10px',
  minHeight: 54,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  color: '#475569',
  background: '#F8FAFC',
  borderRight: '1px solid #D9DEE7',
  borderBottom: '1px solid #D9DEE7',
};

const dayHeaderStyle: CSSProperties = {
  minHeight: 122,
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: '#F8FAFC',
  borderRight: '1px solid #D9DEE7',
  borderBottom: '1px solid #D9DEE7',
};

const currentDayHeaderStyle: CSSProperties = {
  background: '#EDEBFF',
  boxShadow: 'inset 3px 0 0 #3525CD',
};

const todayBadgeStyle: CSSProperties = {
  padding: '2px 8px',
  borderRadius: 999,
  color: '#3525CD',
  background: '#FFFFFF',
  fontSize: 12,
  fontWeight: 700,
};

const cellStyle: CSSProperties = {
  position: 'relative',
  minHeight: 122,
  padding: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  background: '#FFFFFF',
  borderRight: '1px solid #D9DEE7',
  borderBottom: '1px solid #D9DEE7',
};

const currentDayCellStyle: CSSProperties = {
  background: '#FCFBFF',
};

const specialCellStyle: CSSProperties = {
  background: '#FFFBE6',
};

const specialLabelStyle: CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  right: 8,
  padding: '4px 8px',
  borderRadius: 6,
  color: '#AD6800',
  background: '#FFE58F',
  fontSize: 12,
  fontWeight: 700,
};

const scheduleBlockStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: 74,
  padding: '10px 28px 10px 10px',
  border: '1px solid',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 3,
};

const subjectStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  lineHeight: 1.25,
  wordBreak: 'break-word',
};

const metaStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.3,
  color: '#475569',
  wordBreak: 'break-word',
};

const deleteButtonStyle: CSSProperties = {
  position: 'absolute',
  top: 4,
  right: 4,
  width: 22,
  height: 22,
};

const emptySlotStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
};
