package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {
    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/classes")
    public ResponseEntity<?> getMyClasses(@RequestParam String email) {
        return ResponseEntity.ok(
                teacherService.getAllClassesForTeacher(email));
    }

    @GetMapping
    public ResponseEntity<List<Teacher>> getAll() {
        return ResponseEntity.ok(teacherService.getAll());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Teacher> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(teacherService.getByEmail(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Teacher> create(
            @Valid @RequestBody Teacher teacher,
            @RequestParam(required = false) Long classId) {
        return ResponseEntity.ok(teacherService.create(teacher, classId));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Teacher> update(
            @PathVariable Long id,
            @RequestBody Teacher teacher,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long classId,
            @RequestParam(defaultValue = "false") boolean force) {

        return ResponseEntity.ok(
                teacherService.update(id, teacher, subjectId, classId, force));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
