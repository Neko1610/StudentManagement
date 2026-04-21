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

        // 🔥 FIX Ở ĐÂY
        attendance.setPeriod(data.get("period").toString()); // AM4 / AM5 / PM

        attendance.setStatus(data.get("status").toString());
        attendance.setDate(LocalDate.parse(data.get("date").toString()));

        return ResponseEntity.ok(
                attendanceService.create(attendance, studentId, classId));
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
