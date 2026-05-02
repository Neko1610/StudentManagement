package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Student;
import com.schoolmanagement.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(studentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Student> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(studentService.getByEmail(email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Student> create(
            @RequestBody Student student,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) List<Long> parentIds) {

        return ResponseEntity.ok(studentService.create(student, classId, parentIds));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Student>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(studentService.getByClass(classId));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    @PutMapping("/{id}")
    public ResponseEntity<Student> update(
            @PathVariable Long id,
            @RequestBody Student student,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) List<Long> parentIds) {

        return ResponseEntity.ok(studentService.update(id, student, classId, parentIds));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
