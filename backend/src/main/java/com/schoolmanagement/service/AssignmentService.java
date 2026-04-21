package com.schoolmanagement.service;

import com.schoolmanagement.entity.Assignment;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.AssignmentRepository;
import com.schoolmanagement.repository.ClazzRepository;
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
    private final FileService fileService;

    public AssignmentService(AssignmentRepository assignmentRepository, ClazzRepository clazzRepository,
            TeacherRepository teacherRepository, FileService fileService) {
        this.assignmentRepository = assignmentRepository;
        this.clazzRepository = clazzRepository;
        this.teacherRepository = teacherRepository;
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
            MultipartFile file) throws IOException {

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

        return assignmentRepository.save(a);
    }

    public List<Assignment> getByClassId(Long classId) {
        return assignmentRepository.findByClazz_Id(classId);
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
        return assignmentRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignmentRepository.delete(assignment);
    }
}