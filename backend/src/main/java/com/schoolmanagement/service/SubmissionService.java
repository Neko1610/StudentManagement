package com.schoolmanagement.service;

import com.schoolmanagement.entity.Assignment;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Submission;
import com.schoolmanagement.repository.AssignmentRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.SubmissionRepository;
import com.schoolmanagement.util.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.io.IOException;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final FileService fileService;
    private final ScoreService scoreService;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            StudentRepository studentRepository,
            FileService fileService,
            ScoreService scoreService) {

        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.fileService = fileService;
        this.scoreService = scoreService;
    }

    // ================= GET =================
    public List<Submission> getAll() {
        return submissionRepository.findAll();
    }

    public Submission getById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    public List<Submission> getByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignment_Id(assignmentId);
    }

    // ================= SUBMIT FILE =================
    public Submission submit(Long assignmentId, Long studentId, MultipartFile file) throws IOException {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        String filePath = fileService.save(file);

        Submission s = new Submission();
        s.setAssignment(assignment);
        s.setStudent(student);
        s.setFilePath(filePath);
        s.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(s);
    }

    public List<Submission> getByStudent(Long studentId) {
        return submissionRepository.findByStudent_Id(studentId);
    }

    // ================= CHẤM ĐIỂM =================
    @Transactional
    public Submission grade(Long id, Submission updated) {

        Submission existing = getById(id);
        Double previousScore = existing.getScore();

        existing.setScore(updated.getScore());
        existing.setComment(updated.getComment());

        Submission saved = submissionRepository.save(existing);

        Integer realSemester = saved.getAssignment().getSemester();

        scoreService.updateFromSubmission(saved, realSemester, previousScore);

        return saved;
    }

    // ================= DELETE =================
    public void delete(Long id) {
        submissionRepository.deleteById(id);
    }
}
