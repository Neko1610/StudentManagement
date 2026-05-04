package com.schoolmanagement.service;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.util.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final ClazzRepository clazzRepository;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    @Autowired
    private ActivityLogService activityLogService;

    public StudentService(StudentRepository studentRepository, ClazzRepository clazzRepository,
            ParentRepository parentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.clazzRepository = clazzRepository;
        this.parentRepository = parentRepository;
        this.userRepository = userRepository;
    }

    public List<Student> getByClass(Long classId) {
        return studentRepository.findByStudentClass_Id(classId);
    }

    public Student getByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getStudentClass() != null) {
            student.setClassName(student.getStudentClass().getName());
            student.setClassId(student.getStudentClass().getId());
        }

        return student;
    }

    public List<Student> getAll() {
        List<Student> students = studentRepository.findAll();

        for (Student s : students) {
            if (s.getStudentClass() != null) {
                s.setClassName(s.getStudentClass().getName()); // 🔥
                s.setClassId(s.getStudentClass().getId()); // 🔥
            }
        }

        return students;
    }

    private String generateStudentCode() {
        long count = studentRepository.countStudents() + 1;

        return String.format("S%03d", count); // S001, S002...
    }

    private String generateEmail(String studentCode) {
        if (studentCode == null || studentCode.isEmpty())
            return null;

        return "hs" + studentCode.toLowerCase() + "nt@gmail.com";
    }

    public Student getById(Long id) {
        return studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public Student create(Student student, Long classId, List<Long> parentIds) {

        if (student.getStudentCode() == null || student.getStudentCode().isEmpty()) {
            student.setStudentCode(generateStudentCode());
        }

        if (student.getEmail() == null || student.getEmail().isEmpty()) {
            student.setEmail(generateEmail(student.getStudentCode()));
        }

        // CLASS
        if (classId != null) {
            Clazz clazz = clazzRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            student.setStudentClass(clazz);
        }
        student.setActive(true);
        // 🔥 SAVE STUDENT
        Student savedStudent = studentRepository.save(student);
        activityLogService.log(
                "Admin",
                "ADMIN",
                "New Student",
                savedStudent.getFullName(),
                savedStudent.getStudentClass() != null ? savedStudent.getStudentClass().getName() : "-",
                "Enrolled");

        // 🔥 TẠO USER
        if (savedStudent.getEmail() != null &&
                userRepository.findByUsername(savedStudent.getEmail()).isEmpty()) {

            User user = new User();
            user.setUsername(savedStudent.getEmail());
            user.setPassword("123");
            user.setRole(Role.STUDENT);

            userRepository.save(user);
        }

        // 🔥 PARENT
        if (parentIds != null && !parentIds.isEmpty()) {
            Set<Parent> parents = new HashSet<>();

            for (Long pid : parentIds) {
                Parent parent = parentRepository.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

                parents.add(parent);
            }

            savedStudent.setParents(parents);
        }

        return studentRepository.save(savedStudent);
    }

    public Student update(Long id, Student updated, Long classId, List<Long> parentIds) {

        Student existing = getById(id);
        if (updated.getEmail() == null || updated.getEmail().isEmpty()) {
            existing.setEmail(generateEmail(existing.getStudentCode()));
        } else {
            existing.setEmail(updated.getEmail());
        }
        if (updated.getStudentCode() != null) {
            existing.setStudentCode(updated.getStudentCode());
        }
        if (updated.getFullName() != null)
            existing.setFullName(updated.getFullName());

        if (updated.getDob() != null)
            existing.setDob(updated.getDob());

        if (updated.getGender() != null)
            existing.setGender(updated.getGender());

        if (updated.getEmail() != null)
            existing.setEmail(updated.getEmail());

        if (updated.getPhone() != null)
            existing.setPhone(updated.getPhone());
        if (updated.getActive() != null) {
            existing.setActive(updated.getActive());
        }
        // CLASS
        if (classId != null) {
            Clazz clazz = clazzRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            existing.setStudentClass(clazz);
        }

        // 🔥 PARENT
        // 🔥 PARENT
        if (parentIds != null) {

            // ❗ 1. XÓA QUAN HỆ CŨ
            for (Parent oldParent : existing.getParents()) {
                oldParent.getStudents().remove(existing);
            }
            existing.getParents().clear();

            // ❗ 2. TẠO QUAN HỆ MỚI
            Set<Parent> parents = new HashSet<>();

            for (Long pid : parentIds) {
                Parent parent = parentRepository.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

                parents.add(parent);

                // 🔥 sync 2 chiều
                parent.getStudents().add(existing);
            }

            existing.setParents(parents);
        }

        Student saved = studentRepository.save(existing);

        activityLogService.log(
                "Admin",
                "ADMIN",
                "Updated Student",
                saved.getFullName(),
                saved.getStudentClass() != null ? saved.getStudentClass().getName() : "-",
                "Updated");

        return saved;
    }

    public void delete(Long id) {
        Student student = getById(id);

        // 🔥 XÓA USER TRƯỚC
        if (student.getEmail() != null) {
            userRepository.findByUsername(student.getEmail())
                    .ifPresent(user -> userRepository.delete(user));
        }

        // 🔥 XÓA STUDENT
        studentRepository.delete(student);
        activityLogService.log(
                "Admin",
                "ADMIN",
                "Deleted Student",
                student.getFullName(),
                student.getStudentClass() != null ? student.getStudentClass().getName() : "-",
                "Removed");
    }
}
