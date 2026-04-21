package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.service.ParentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/parents")
@CrossOrigin(origins = "*")
public class ParentController {
    private final ParentService parentService;

    public ParentController(ParentService parentService) {
        this.parentService = parentService;
    }

    @GetMapping
    public ResponseEntity<List<Parent>> getAll() {
        return ResponseEntity.ok(parentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parent> getById(@PathVariable Long id) {
        return ResponseEntity.ok(parentService.getById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Parent> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(parentService.getByEmail(email));
    }

    @GetMapping("/email/{email}/students")
    public ResponseEntity<Set<Student>> getStudents(@PathVariable String email) {
        return ResponseEntity.ok(parentService.getStudentsByParentEmail(email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Parent> create(@Valid @RequestBody Parent parent) {
        return ResponseEntity.ok(parentService.create(parent));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Parent> update(@PathVariable Long id, @Valid @RequestBody Parent parent) {
        return ResponseEntity.ok(parentService.update(id, parent));
    }

    @PutMapping("/email/{email}")
    public ResponseEntity<Parent> updateByEmail(
            @PathVariable String email,
            @RequestBody Parent parent) {

        return ResponseEntity.ok(parentService.updateByEmail(email, parent));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        parentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
