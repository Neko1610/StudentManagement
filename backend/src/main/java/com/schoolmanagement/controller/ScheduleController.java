package com.schoolmanagement.controller;

import com.schoolmanagement.dto.ScheduleDTO;
import com.schoolmanagement.entity.Schedule;
import com.schoolmanagement.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {
    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getAll() {
        return ResponseEntity.ok(scheduleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getById(id));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<ScheduleDTO>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(scheduleService.getByClass(classId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Schedule>> getByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(scheduleService.getByTeacher(teacherId));
    }

    @GetMapping("/teacher/email/{email}")
    public ResponseEntity<List<ScheduleDTO>> getByTeacherEmail(@PathVariable String email) {
        return ResponseEntity.ok(scheduleService.getByTeacherEmail(email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Schedule> create(@Valid @RequestBody Schedule schedule,
            @RequestParam Long classId,
            @RequestParam Long subjectId,
            @RequestParam Long teacherId) {
        return ResponseEntity.ok(scheduleService.create(schedule, classId, subjectId, teacherId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate")
    public ResponseEntity<List<Schedule>> generate() {
        return ResponseEntity.ok(scheduleService.autoGenerate());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Schedule> update(@PathVariable Long id,
            @Valid @RequestBody Schedule schedule,
            @RequestParam Long classId,
            @RequestParam Long subjectId,
            @RequestParam Long teacherId) {
        return ResponseEntity.ok(scheduleService.update(id, schedule, classId, subjectId, teacherId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
