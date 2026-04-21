package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.service.ClazzService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/classes")
@CrossOrigin(origins = "*")
public class ClassController {
    private final ClazzService clazzService;

    public ClassController(ClazzService clazzService) {
        this.clazzService = clazzService;
    }

    @GetMapping
    public ResponseEntity<List<Clazz>> getAll() {
        return ResponseEntity.ok(clazzService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Clazz> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clazzService.getById(id));
    }

    @GetMapping("/teacher/email/{email}")
    public ResponseEntity<List<Clazz>> getByTeacherEmail(@PathVariable String email) {
        return ResponseEntity.ok(clazzService.getByTeacherEmail(email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Clazz> create(@Valid @RequestBody Clazz clazz,
            @RequestParam(required = false) Long homeroomTeacherId) {
        return ResponseEntity.ok(clazzService.create(clazz, homeroomTeacherId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Clazz> update(@PathVariable Long id, @Valid @RequestBody Clazz clazz,
            @RequestParam(required = false) Long homeroomTeacherId) {
        return ResponseEntity.ok(clazzService.update(id, clazz, homeroomTeacherId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clazzService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
