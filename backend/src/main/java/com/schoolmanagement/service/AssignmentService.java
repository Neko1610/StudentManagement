package com.schoolmanagement.service;

import com.schoolmanagement.dto.AssignmentStatusDTO;
import com.schoolmanagement.entity.Assignment;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.ScoreType;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Submission;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.AssignmentRepository;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.SubmissionRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import com.fasterxml.jackson.annotation.JsonIgnore;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final ClazzRepository clazzRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubmissionRepository submissionRepository;
    private final FileService fileService;

    public AssignmentService(AssignmentRepository assignmentRepository, ClazzRepository clazzRepository,
            TeacherRepository teacherRepository, StudentRepository studentRepository,
            SubmissionRepository submissionRepository, FileService fileService) {
        this.assignmentRepository = assignmentRepository;
        this.clazzRepository = clazzRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.submissionRepository = submissionRepository;
        this.fileService = fileService;

    }

    public List<Assignment> getAll() {
        return assignmentRepository.findAll();
    }

    public Assignment getById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    public Assignment createWithFileByEmail(
            Long classId,
            String email,
            String title,
            String description,
            String deadline,
            MultipartFile file,
            ScoreType type,
            Integer semester) throws IOException {

        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        String fileName = fileService.save(file);

        Assignment a = new Assignment();
        a.setTitle(title);
        a.setDescription(description);
        a.setDeadline(LocalDate.parse(deadline));
        a.setClazz(clazz);
        a.setTeacher(teacher);
        a.setFilePath(fileName);
        a.setType(type != null ? type : ScoreType.TEST15);
        a.setSemester(semester != null ? semester : 1);

        return assignmentRepository.save(a);
    }

    public List<Assignment> getByClassId(Long classId) {
        return assignmentRepository.findByClazz_Id(classId);
    }

    public List<Assignment> getByClassForStudent(Long classId, Integer semester) {
        return assignmentRepository
                .findByClazz_IdAndSemester(classId, semester);
    }

    public List<AssignmentStatusDTO> getByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (student.getStudentClass() == null) {
            return List.of();
        }

        List<Submission> submissions = submissionRepository.findByStudent_Id(studentId);
        List<Assignment> assignments = assignmentRepository.findByClazz_Id(student.getStudentClass().getId());

        return assignments.stream().map(assignment -> {
            Submission submission = submissions.stream()
                    .filter(s -> s.getAssignment() != null && s.getAssignment().getId().equals(assignment.getId()))
                    .findFirst()
                    .orElse(null);

            AssignmentStatusDTO dto = new AssignmentStatusDTO();
            dto.setId(assignment.getId());
            dto.setTitle(assignment.getTitle());
            dto.setSubject(assignment.getTeacher() != null && assignment.getTeacher().getSubject() != null
                    ? assignment.getTeacher().getSubject().getName()
                    : null);
            dto.setDueDate(assignment.getDeadline());
            dto.setStatus(submission == null ? "MISSING" : "SUBMITTED");
            dto.setSubmittedAt(submission != null ? submission.getSubmittedAt() : null);
            return dto;
        }).toList();
    }

    public List<Assignment> getByClassAndTeacher(Long classId, String email) {
        return assignmentRepository.findByClazz_IdAndTeacher_Email(classId, email);
    }

    public Assignment create(Assignment assignment, Long classId, Long teacherId) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        assignment.setClazz(clazz);
        assignment.setTeacher(teacher);
        return assignmentRepository.save(assignment);
    }

    public Assignment update(Long id, Assignment updated) {
        Assignment existing = getById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setDeadline(updated.getDeadline());
        if (updated.getType() != null) {
            existing.setType(updated.getType());
        }
        if (updated.getSemester() != null) {
            existing.setSemester(updated.getSemester());
        }
        return assignmentRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignmentRepository.delete(assignment);
    }
}
