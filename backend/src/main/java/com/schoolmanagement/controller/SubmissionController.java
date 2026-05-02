package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Submission;
import com.schoolmanagement.service.SubmissionService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ================= GET ALL =================
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @GetMapping
    public ResponseEntity<List<Submission>> getAll() {
        return ResponseEntity.ok(submissionService.getAll());
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<Submission> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getById(id));
    }

    // ================= GET BY ASSIGNMENT =================
    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<Submission>> getByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getByAssignment(assignmentId));
    }

    // ================= STUDENT SUBMIT FILE =================
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/submit")
    public ResponseEntity<Submission> submit(
            @RequestParam Long assignmentId,
            @RequestParam Long studentId,
            @RequestParam MultipartFile file) throws IOException {

        return ResponseEntity.ok(
                submissionService.submit(assignmentId, studentId, file));
    }

    // ================= TEACHER CHẤM ĐIỂM =================
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Submission> grade(
            @PathVariable Long id,
            @RequestBody Submission submission) {

        return ResponseEntity.ok(
                submissionService.grade(id, submission));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Submission>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(submissionService.getByStudent(studentId));
    }

    // ================= DELETE =================
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        submissionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ================= DOWNLOAD FILE =================
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> download(@PathVariable String filename) throws IOException {

        Path path = Paths.get("uploads/" + filename);
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .body(resource);
    }
}
