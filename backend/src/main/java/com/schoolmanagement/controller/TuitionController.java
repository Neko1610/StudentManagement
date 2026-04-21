package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Tuition;
import com.schoolmanagement.repository.TuitionRepository;
import com.schoolmanagement.service.TuitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/tuitions")
@CrossOrigin(origins = "*")
public class TuitionController {
    private final TuitionService tuitionService;
    private final TuitionRepository tuitionRepository;

    public TuitionController(TuitionService tuitionService, TuitionRepository tuitionRepository) {
        this.tuitionService = tuitionService;
        this.tuitionRepository = tuitionRepository;

    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Tuition> pay(@PathVariable Long id) {
        return ResponseEntity.ok(
                tuitionService.update(id, "PAID"));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Tuition>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(
                tuitionRepository.findByStudent_Id(studentId));
    }

    @GetMapping
    public ResponseEntity<List<Tuition>> getAll() {
        return ResponseEntity.ok(tuitionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tuition> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tuitionService.getById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','PARENT')")
    @PostMapping
    public ResponseEntity<Tuition> create(@Valid @RequestBody Tuition tuition, @RequestParam Long studentId) {
        return ResponseEntity.ok(tuitionService.create(tuition, studentId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Tuition> update(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(tuitionService.update(id, status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tuitionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
