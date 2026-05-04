package com.schoolmanagement.service;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Schedule;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.ScheduleRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.util.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final ClazzRepository clazzRepository;
    private final ScheduleRepository scheduleRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    @Autowired
    private ActivityLogService activityLogService;

    public TeacherService(TeacherRepository teacherRepository,
            SubjectRepository subjectRepository,
            ClazzRepository clazzRepository,
            ScheduleRepository scheduleRepository,
            StudentRepository studentRepository,
            UserRepository userRepository) {
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.clazzRepository = clazzRepository;
        this.scheduleRepository = scheduleRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    private String generateEmail(String fullName) {
        if (fullName == null || fullName.isEmpty())
            return null;

        String normalized = java.text.Normalizer.normalize(fullName, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("đ", "d")
                .replaceAll("Đ", "d")
                .toLowerCase()
                .replaceAll("\\s+", "");

        return "gv" + normalized + "tn@gmail.com";
    }

    public List<Clazz> getAllClassesForTeacher(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Long teacherId = teacher.getId();

        List<Clazz> homeroom = clazzRepository.findByHomeroomTeacherId(teacherId);
        List<Schedule> schedules = scheduleRepository.findByTeacherId(teacherId);

        Set<Clazz> teaching = new HashSet<>();
        for (Schedule s : schedules) {
            teaching.add(s.getClazz());
        }

        Map<Long, Clazz> map = new HashMap<>();
        for (Clazz c : homeroom)
            map.put(c.getId(), c);
        for (Clazz c : teaching)
            map.put(c.getId(), c);

        for (Clazz c : map.values()) {
            int count = studentRepository.countStudentsByClassId(c.getId());
            c.setStudentCount(count);

            // 🔥 SET HOMEROOM
            if (c.getHomeroomTeacher() != null &&
                    c.getHomeroomTeacher().getId().equals(teacherId)) {
                c.setHomeroom(true);
            } else {
                c.setHomeroom(false);
            }
        }

        return new ArrayList<>(map.values());
    }

    public List<Teacher> getAll() {

        // 🔥 fetch subject (quan trọng)
        List<Teacher> teachers = teacherRepository.findAllWithSubject();

        // 🔥 lấy tất cả class 1 lần
        List<Clazz> allClazz = clazzRepository.findAllWithHomeroomTeacher();

        // 🔥 map homeroom (tránh loop N*M)
        Map<Long, Clazz> homeroomMap = new HashMap<>();

        for (Clazz c : allClazz) {
            if (c.getHomeroomTeacher() != null) {
                homeroomMap.put(c.getHomeroomTeacher().getId(), c);
            }
        }

        // 🔥 xử lý teacher
        for (Teacher t : teachers) {

            // subject
            if (t.getSubject() != null) {
                t.setSubjectName(t.getSubject().getName());
                t.setSubjectId(t.getSubject().getId());
            }

            // tránh null phone
            if (t.getPhone() == null) {
                t.setPhone("");
            }

            // homeroom
            Clazz homeroom = homeroomMap.get(t.getId());

            if (homeroom != null) {
                t.setHomeroomClassName(homeroom.getName());
                t.setHomeroomClassId(homeroom.getId());
            }
        }

        return teachers;
    }

    public Teacher getById(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }

    public Teacher getByEmail(String email) {
        return teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with email: " + email));
    }

    public Teacher create(Teacher teacher, Long classId) {
        teacher.setId(null);

        if (teacher.getEmail() == null || teacher.getEmail().isEmpty()) {
            throw new RuntimeException("EMAIL_REQUIRED");
        }

        String prefix = teacher.getEmail().trim().toLowerCase()
                .replaceAll("[^a-z0-9]", "");

        String email = "gv" + prefix + "nt@gmail.com";

        if (userRepository.findByUsername(email).isPresent()) {
            throw new RuntimeException("EMAIL_EXISTS");
        }

        teacher.setEmail(email);

        if (teacher.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(teacher.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
            teacher.setSubject(subject);
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        activityLogService.log(
                "Admin",
                "ADMIN",
                "New Teacher",
                savedTeacher.getFullName(),
                "-",
                "Active");

        try {
            User user = new User();
            user.setUsername(email);
            user.setPassword("123");
            user.setRole(Role.TEACHER);
            userRepository.save(user);
        } catch (Exception ignored) {
        }

        if (classId != null) {
            Clazz clazz = clazzRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            clazz.setHomeroomTeacher(savedTeacher);
            clazzRepository.save(clazz);
        }

        return savedTeacher; // 🔥 QUAN TRỌNG NHẤT
    }

    public Teacher update(Long id, Teacher update, Long subjectId, Long classId, boolean force) {
        Teacher existing = getById(id);

        if (update.getPhone() != null)
            existing.setPhone(update.getPhone());

        existing.setFullName(update.getFullName());
        existing.setDob(update.getDob());
        existing.setDegree(update.getDegree());
        if (update.getQualifications() != null) {
            existing.setQualifications(update.getQualifications());
        }
        if (update.getEmail() != null && !update.getEmail().isEmpty()) {

            String prefix = update.getEmail().trim().toLowerCase()
                    .replaceAll("[^a-z0-9]", "");

            String email = "gv" + prefix + "nt@gmail.com";

            if (userRepository.findByUsername(email).isPresent()
                    && !email.equals(existing.getEmail())) {

                throw new RuntimeException("EMAIL_EXISTS");
            }

            existing.setEmail(email);
        }

        if (subjectId != null) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
            existing.setSubject(subject);
        }

        if (classId != null) {
            Clazz clazz = clazzRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            if (!force &&
                    clazz.getHomeroomTeacher() != null &&
                    !clazz.getHomeroomTeacher().getId().equals(id)) {
                throw new RuntimeException("CLASS_HAS_HOMEROOM");
            }

            List<Clazz> oldClasses = clazzRepository.findByHomeroomTeacherId(existing.getId());
            for (Clazz c : oldClasses) {
                c.setHomeroomTeacher(null);
                clazzRepository.save(c);
            }

            clazz.setHomeroomTeacher(existing);
            clazzRepository.save(clazz);
        }

        Teacher saved = teacherRepository.save(existing);

        activityLogService.log(
                "Admin",
                "ADMIN",
                "Updated Teacher",
                saved.getFullName(),
                "-",
                "Updated");

        return saved;
    }

    public void delete(Long id) {
        Teacher teacher = getById(id);

        // 🔥 1. GỠ GVCN KHỎI CLASS
        List<Clazz> classes = clazzRepository.findByHomeroomTeacherId(id);

        for (Clazz c : classes) {
            c.setHomeroomTeacher(null);
            clazzRepository.save(c);
        }

        // 🔥 2. XÓA USER
        if (teacher.getEmail() != null) {
            userRepository.findByUsername(teacher.getEmail())
                    .ifPresent(userRepository::delete);
        }

        // 🔥 3. XÓA TEACHER
        teacherRepository.deleteById(id);
        activityLogService.log(
                "Admin",
                "ADMIN",
                "Deleted Teacher",
                teacher.getFullName(),
                "-",
                "Removed");
    }
}