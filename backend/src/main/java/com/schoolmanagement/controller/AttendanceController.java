package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Attendance>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(attendanceService.getByClass(classId));
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAll() {
        return ResponseEntity.ok(attendanceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getByStudentId(studentId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<Attendance> create(@RequestBody Map<String, Object> data) {

        Long studentId = Long.valueOf(data.get("studentId").toString());
        Long classId = Long.valueOf(data.get("classId").toString());

        Attendance attendance = new Attendance();

        Object period = data.get("period");
        Object session = data.get("session");
        attendance.setPeriod(normalizePeriod(period != null ? period.toString() : session != null ? session.toString() : null));
        if (session != null) {
            attendance.setSession(session.toString());
        }

        attendance.setStatus(data.get("status").toString());
        attendance.setDate(LocalDate.parse(data.get("date").toString()));
        if (data.get("remark") != null) {
            attendance.setRemark(data.get("remark").toString());
        }

        return ResponseEntity.ok(
                attendanceService.create(attendance, studentId, classId));
    }

    private String normalizePeriod(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("period is required");
        }
        return switch (value) {
            case "AM4", "AM5" -> "1";
            case "PM" -> "6";
            default -> value;
        };
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Attendance> update(@PathVariable Long id, @Valid @RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceService.update(id, attendance));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
