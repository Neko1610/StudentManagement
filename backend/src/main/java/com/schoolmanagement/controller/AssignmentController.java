package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Assignment;
import com.schoolmanagement.service.AssignmentService;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import org.springframework.http.MediaType;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {
    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAll() {
        return ResponseEntity.ok(assignmentService.getAll());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Assignment>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(assignmentService.getByClassId(classId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Assignment> create(
            @RequestParam Long classId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam String deadline,
            @RequestParam MultipartFile file,
            @RequestParam String email) throws Exception {

        return ResponseEntity.ok(
                assignmentService.createWithFileByEmail(
                        classId,
                        email,
                        title,
                        description,
                        deadline,
                        file));
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> download(@PathVariable String filename) throws IOException {

        Path path = Paths.get("uploads/" + filename);
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .body(resource);
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Assignment> update(@PathVariable Long id, @Valid @RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.update(id, assignment));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
