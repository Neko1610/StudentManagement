package com.schoolmanagement.controller;

import com.schoolmanagement.dto.ScoreDTO;
import com.schoolmanagement.entity.Score;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.service.ScoreService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/scores")
@CrossOrigin(origins = "*")
public class ScoreController {
    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @GetMapping
    public ResponseEntity<List<Score>> getAll() {
        return ResponseEntity.ok(scoreService.getAll());
    }

    @GetMapping("/class/{classId}")
    public List<ScoreDTO> getByClass(
            @PathVariable Long classId,
            @RequestParam String email) {

        return scoreService.getByClassAndTeacher(classId, email);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Score> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scoreService.getById(id));
    }

    @GetMapping("/export/{studentId}")
    public ResponseEntity<byte[]> exportByStudent(
            @PathVariable Long studentId,
            @RequestParam Integer semester) throws IOException {

        byte[] file = scoreService.exportByStudent(studentId, semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=score_student_" + studentId + "_hk" + semester + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/export/student/{studentId}")
    public ResponseEntity<byte[]> exportByStudentAlias(
            @PathVariable Long studentId,
            @RequestParam Integer semester) throws IOException {

        return exportByStudent(studentId, semester);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ScoreDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(scoreService.getByStudentId(studentId));
    }

    @GetMapping("/teacher/student/{studentId}")
    public ResponseEntity<List<ScoreDTO>> getByTeacher(
            @PathVariable Long studentId,
            @RequestParam String email) {

        return ResponseEntity.ok(
                scoreService.getByStudentAndTeacher(studentId, email));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<Score> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(scoreService.create(toScore(data)));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Score> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> data,
            @RequestParam Integer semester // 🔥 thêm
    ) {
        return ResponseEntity.ok(scoreService.update(id, toScore(data), semester));
    }

    private Score toScore(Map<String, Object> data) {
        Score score = new Score();

        Long studentId = getId(data, "studentId", "student");
        Long subjectId = getId(data, "subjectId", "subject");
        Integer semester = getInteger(data.get("semester"));

        Student student = new Student();
        student.setId(studentId);
        score.setStudent(student);

        Subject subject = new Subject();
        subject.setId(subjectId);
        score.setSubject(subject);
        score.setSemester(semester);

        if (semester != null && semester == 2) {
            score.setOral2(getDouble(firstValue(data, "oral", "oral2")));
            score.setTest15_2(getDouble(firstValue(data, "test15", "test15_2")));
            score.setMid2(getDouble(firstValue(data, "mid", "mid2")));
            score.setFinal2(getDouble(firstValue(data, "final", "final2")));
        } else {
            score.setOral1(getDouble(firstValue(data, "oral", "oral1")));
            score.setTest15_1(getDouble(firstValue(data, "test15", "test15_1")));
            score.setMid1(getDouble(firstValue(data, "mid", "mid1")));
            score.setFinal1(getDouble(firstValue(data, "final", "final1")));
        }

        return score;
    }

    private Long getId(Map<String, Object> data, String flatKey, String nestedKey) {
        Object flatValue = data.get(flatKey);
        if (flatValue != null) {
            return Long.valueOf(flatValue.toString());
        }

        Object nestedValue = data.get(nestedKey);
        if (nestedValue instanceof Map<?, ?> nestedMap && nestedMap.get("id") != null) {
            return Long.valueOf(nestedMap.get("id").toString());
        }

        throw new IllegalArgumentException(flatKey + " is required");
    }

    private Object firstValue(Map<String, Object> data, String firstKey, String secondKey) {
        Object first = data.get(firstKey);
        return first != null ? first : data.get(secondKey);
    }

    private Integer getInteger(Object value) {
        return value == null ? null : Integer.valueOf(value.toString());
    }

    private Double getDouble(Object value) {
        return value == null ? null : Double.valueOf(value.toString());
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scoreService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam Integer semester) throws IOException {

        byte[] content = scoreService.exportAll(semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=score-report.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    @GetMapping("/export/class/{classId}")
    public ResponseEntity<byte[]> exportByClass(
            @PathVariable Long classId,
            @RequestParam Integer semester) throws IOException {

        byte[] content = scoreService.exportByClass(classId, semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=score_class_" + classId + "_hk" + semester + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    @GetMapping("/export/teacher/class/{classId}")
    public ResponseEntity<byte[]> exportTeacher(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "1") Integer semester,
            @RequestParam String email) throws IOException {

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        byte[] data = scoreService.exportTeacher(classId, semester, email);

        if (data == null || data.length == 0) {
            throw new RuntimeException("Không có dữ liệu để export");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=teacher_class_" + classId + "_hk" + semester + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/export/class/{classId}/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long classId,
            @RequestParam Integer semester) {

        try {
            // 🔥 lấy email từ login
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            byte[] data = scoreService.exportPdf(classId, semester, email);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=score_class_" + classId + "_hk" + semester + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(data);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 debug

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/export/student/{studentId}/pdf")
    public ResponseEntity<byte[]> exportPdfByStudent(
            @PathVariable Long studentId,
            @RequestParam Integer semester) {
        byte[] data = scoreService.exportPdfByStudent(studentId, semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=score_student_" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
