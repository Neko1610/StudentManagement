package com.schoolmanagement.service;

import com.schoolmanagement.dto.ScheduleDTO;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Schedule;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.ScheduleRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ClazzRepository clazzRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public ScheduleService(ScheduleRepository scheduleRepository, ClazzRepository clazzRepository,
            SubjectRepository subjectRepository, TeacherRepository teacherRepository) {
        this.scheduleRepository = scheduleRepository;
        this.clazzRepository = clazzRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
    }

    public List<Schedule> getAll() {
        return scheduleRepository.findAll();
    }

    public Schedule getById(Long id) {
        return scheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
    }

    public List<ScheduleDTO> getByClass(Long classId) {
        List<Schedule> list = scheduleRepository.findByClazzId(classId);

        return list.stream().map(s -> {
            ScheduleDTO dto = new ScheduleDTO();

            dto.setId(s.getId());
            dto.setDayOfWeek(s.getDayOfWeek().name());
            dto.setPeriod(s.getPeriod());

            dto.setClassName(s.getClazz().getName());
            dto.setSubjectName(
                    s.getSubject() != null
                            ? s.getSubject().getName()
                            : (s.getPeriod() == 1 ? "Chào cờ" : "SHCN"));
            dto.setRoom(s.getClazz().getRoom());

            return dto;
        }).toList();
    }

    public List<Schedule> getByTeacher(Long teacherId) {
        return scheduleRepository.findFullByTeacherId(teacherId);
    }

    public Schedule create(Schedule schedule, Long classId, Long subjectId, Long teacherId) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        if (!scheduleRepository
                .findByTeacherAndDayOfWeekAndPeriod(teacher, schedule.getDayOfWeek(), schedule.getPeriod()).isEmpty()) {
            throw new IllegalStateException("Teacher already has a class at this time");
        }
        if (!scheduleRepository.findByClazzAndDayOfWeekAndPeriod(clazz, schedule.getDayOfWeek(), schedule.getPeriod())
                .isEmpty()) {
            throw new IllegalStateException("Class already has a subject at this time");
        }

        schedule.setClazz(clazz);
        schedule.setSubject(subject);
        schedule.setTeacher(teacher);
        return scheduleRepository.save(schedule);
    }

    public List<ScheduleDTO> getByTeacherEmail(String email) {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found")); // 🔥 chuẩn nhất

        List<Schedule> list = scheduleRepository.findFullByTeacherId(teacher.getId());

        return list.stream().map(s -> {
            ScheduleDTO dto = new ScheduleDTO();
            dto.setId(s.getId());
            dto.setClassName(s.getClazz().getName());
            dto.setSubjectName(s.getSubject() != null ? s.getSubject().getName() : null);
            dto.setRoom(s.getClazz().getRoom());
            dto.setDayOfWeek(s.getDayOfWeek().name());
            dto.setPeriod(s.getPeriod());
            return dto;
        }).toList();
    }

    public Schedule update(Long id, Schedule schedule, Long classId, Long subjectId, Long teacherId) {
        Schedule existing = getById(id);
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        if (!scheduleRepository
                .findByTeacherAndDayOfWeekAndPeriod(teacher, schedule.getDayOfWeek(), schedule.getPeriod()).stream()
                .allMatch(s -> s.getId().equals(id))) {
            throw new IllegalStateException("Teacher already has a class at this time");
        }
        if (!scheduleRepository.findByClazzAndDayOfWeekAndPeriod(clazz, schedule.getDayOfWeek(), schedule.getPeriod())
                .stream().allMatch(s -> s.getId().equals(id))) {
            throw new IllegalStateException("Class already has a subject at this time");
        }

        existing.setClazz(clazz);
        existing.setSubject(subject);
        existing.setTeacher(teacher);
        existing.setDayOfWeek(schedule.getDayOfWeek());
        existing.setPeriod(schedule.getPeriod());
        return scheduleRepository.save(existing);
    }

    public List<Schedule> autoGenerate() {
        scheduleRepository.deleteAll();

        List<Clazz> classes = clazzRepository.findAll();
        List<Teacher> teachers = teacherRepository.findAll();
        List<Subject> subjects = subjectRepository.findAll();

        Map<String, Integer> subjectPeriods = new HashMap<>();
        subjectPeriods.put("TOAN", 6);
        subjectPeriods.put("VAN", 6);
        subjectPeriods.put("ANH", 6);
        subjectPeriods.put("LY", 3);
        subjectPeriods.put("HOA", 3);
        subjectPeriods.put("SU", 1);
        subjectPeriods.put("DIA", 1);
        subjectPeriods.put("GDCD", 1);
        subjectPeriods.put("THE DUC", 2);

        Map<String, Boolean> teacherBusy = new HashMap<>();
        Map<String, Boolean> classBusy = new HashMap<>();
        List<Schedule> result = new ArrayList<>();
        Random random = new Random();

        for (Clazz clazz : classes) {
            for (Subject subject : subjects) {
                int requiredPeriods = getRequiredPeriods(subject, subjectPeriods);

                for (int i = 0; i < requiredPeriods; i++) {
                    boolean created = false;
                    int retry = 0;

                    while (!created && retry < 1000) {
                        retry++;

                        int dayNumber = random.nextInt(6) + 2;
                        int period = random.nextInt(9) + 1;

                        if (dayNumber == 2 && (period == 1 || period == 2)) {
                            continue;
                        }

                        Schedule.DayOfWeek dayOfWeek = toDayOfWeek(dayNumber);
                        if (dayOfWeek == null) {
                            continue;
                        }

                        Teacher teacher = selectTeacherForSubject(teachers, subject, random);
                        if (teacher == null) {
                            continue;
                        }

                        String teacherKey = teacher.getId() + "-" + dayOfWeek + "-" + period;
                        String classKey = clazz.getId() + "-" + dayOfWeek + "-" + period;

                        if (teacherBusy.containsKey(teacherKey) || classBusy.containsKey(classKey)) {
                            continue;
                        }

                        Schedule schedule = new Schedule();
                        schedule.setClazz(clazz);
                        schedule.setTeacher(teacher);
                        schedule.setSubject(subject);
                        schedule.setDayOfWeek(dayOfWeek);
                        schedule.setPeriod(period);

                        result.add(schedule);
                        teacherBusy.put(teacherKey, true);
                        classBusy.put(classKey, true);
                        created = true;
                    }
                }
            }

            addSpecialSlot(result, classBusy, clazz, Schedule.DayOfWeek.MONDAY, 1);
            addSpecialSlot(result, classBusy, clazz, Schedule.DayOfWeek.MONDAY, 2);
        }

        return scheduleRepository.saveAll(result);
    }

    private Teacher selectTeacherForSubject(List<Teacher> teachers, Subject subject, Random random) {
        List<Teacher> matchingTeachers = teachers.stream()
                .filter(teacher -> teacher.getSubject() != null
                        && teacher.getSubject().getId() != null
                        && teacher.getSubject().getId().equals(subject.getId()))
                .toList();

        List<Teacher> candidates = matchingTeachers.isEmpty() ? teachers : matchingTeachers;
        if (candidates.isEmpty()) {
            return null;
        }

        return candidates.get(random.nextInt(candidates.size()));
    }

    private void addSpecialSlot(
            List<Schedule> result,
            Map<String, Boolean> classBusy,
            Clazz clazz,
            Schedule.DayOfWeek dayOfWeek,
            int period) {
        String classKey = clazz.getId() + "-" + dayOfWeek + "-" + period;
        if (classBusy.containsKey(classKey)) {
            return;
        }

        // 🔥 tìm subject CC / SHCN
        String name = period == 1 ? "Chào cờ" : "SHCN";

        Subject subject = subjectRepository.findAll().stream()
                .filter(s -> normalizeSubjectName(s.getName())
                        .contains(period == 1 ? "CHAO CO" : "SHCN"))
                .findFirst()
                .orElse(null);

        Schedule schedule = new Schedule();
        schedule.setClazz(clazz);
        schedule.setSubject(subject); // 🔥 KHÔNG NULL NỮA
        schedule.setTeacher(null);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setPeriod(period);

        result.add(schedule);
        classBusy.put(classKey, true);
    }

    private Schedule.DayOfWeek toDayOfWeek(int dayNumber) {
        return switch (dayNumber) {
            case 2 -> Schedule.DayOfWeek.MONDAY;
            case 3 -> Schedule.DayOfWeek.TUESDAY;
            case 4 -> Schedule.DayOfWeek.WEDNESDAY;
            case 5 -> Schedule.DayOfWeek.THURSDAY;
            case 6 -> Schedule.DayOfWeek.FRIDAY;
            default -> null;
        };
    }

    private int getRequiredPeriods(Subject subject, Map<String, Integer> subjectPeriods) {
        String name = normalizeSubjectName(subject.getName());

        if (name.contains("TOAN")) {
            return subjectPeriods.get("TOAN");
        }
        if (name.contains("VAN")) {
            return subjectPeriods.get("VAN");
        }
        if (name.contains("ANH") || name.contains("ENGLISH")) {
            return subjectPeriods.get("ANH");
        }
        if (name.contains("LY")) {
            return subjectPeriods.get("LY");
        }
        if (name.contains("HOA")) {
            return subjectPeriods.get("HOA");
        }
        if (name.contains("SU")) {
            return subjectPeriods.get("SU");
        }
        if (name.contains("DIA")) {
            return subjectPeriods.get("DIA");
        }
        if (name.contains("GDCD") || name.contains("GIAO DUC CONG DAN")) {
            return subjectPeriods.get("GDCD");
        }
        if (name.contains("THE DUC") || name.contains("GIAO DUC THE CHAT")) {
            return subjectPeriods.get("THE DUC");
        }

        return 0;
    }

    private String normalizeSubjectName(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D")
                .toUpperCase()
                .trim();
    }

    public void delete(Long id) {
        scheduleRepository.deleteById(id);
    }
}
